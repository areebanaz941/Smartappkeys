// routes/bike-routes.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const BikeRoute = require('../models/Route');
const gpxParser = require('gpxparser'); // You'll need to install this package
const DOMParser = require('xmldom').DOMParser;
const toGeoJSON = require('@mapbox/togeojson'); // You'll need to install this package

// Configure multer for GPX file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/gpx');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only GPX files
  if (file.mimetype === 'application/xml' || file.mimetype === 'application/gpx+xml' || 
      file.originalname.toLowerCase().endsWith('.gpx')) {
    cb(null, true);
  } else {
    cb(new Error('Only GPX files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET all bike routes
router.get('/', async (req, res) => {
  try {
    // Add query parameters for filtering
    const filter = {};
    
    // Filter by difficulty if provided
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    // Filter by road type if provided
    if (req.query.roadType) {
      filter.roadType = req.query.roadType;
    }
    
    // Filter by min/max distance
    if (req.query.minDistance) {
      filter['stats.totalDistance'] = { $gte: parseFloat(req.query.minDistance) };
    }
    if (req.query.maxDistance) {
      if (filter['stats.totalDistance']) {
        filter['stats.totalDistance'].$lte = parseFloat(req.query.maxDistance);
      } else {
        filter['stats.totalDistance'] = { $lte: parseFloat(req.query.maxDistance) };
      }
    }
    
    // Geographic search if coordinates provided
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseFloat(req.query.radius); // in kilometers
      
      // Find routes where the bounding box overlaps with the search area
      filter.$or = [
        {
          'boundingBox.minLat': { $lte: lat + (radius / 111) }, // approx conversion
          'boundingBox.maxLat': { $gte: lat - (radius / 111) },
          'boundingBox.minLng': { $lte: lng + (radius / (111 * Math.cos(lat * Math.PI / 180))) },
          'boundingBox.maxLng': { $gte: lng - (radius / (111 * Math.cos(lat * Math.PI / 180))) }
        }
      ];
    }
    
    // Search by text if provided
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Query with filter and pagination
    const routes = await BikeRoute.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await BikeRoute.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: routes.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit
      },
      data: routes
    });
  } catch (error) {
    console.error('Error fetching bike routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bike routes',
      error: error.message
    });
  }
});

// GET GPX file by filename
router.get('/gpx/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/gpx', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'GPX file not found'
      });
    }
    
    // Set content type for GPX files
    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving GPX file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve GPX file',
      error: error.message
    });
  }
});

// GET GPX file for a specific route
router.get('/:id/gpx', async (req, res) => {
  try {
    const route = await BikeRoute.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Bike route not found'
      });
    }
    
    // Check if route has a GPX file
    if (!route.fileName) {
      return res.status(404).json({
        success: false,
        message: 'No GPX file associated with this route'
      });
    }
    
    const filePath = path.join(__dirname, '../uploads/gpx', route.fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'GPX file not found on server'
      });
    }
    
    // Set content type for GPX files
    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${route.fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving route GPX file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve GPX file',
      error: error.message
    });
  }
});

// GET a specific route's path data (for map display)
router.get('/:id/path', async (req, res) => {
  try {
    const route = await BikeRoute.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Bike route not found'
      });
    }
    
    // Check if route has path data
    if (!route.path || route.path.length === 0) {
      // If no path data but GPX file exists, process GPX file to generate path
      if (route.fileName) {
        const filePath = path.join(__dirname, '../uploads/gpx', route.fileName);
        
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({
            success: false,
            message: 'GPX file not found on server'
          });
        }
        
        // Read and parse GPX file
        const gpxContent = fs.readFileSync(filePath, 'utf8');
        const path = await processGpxData(gpxContent);
        
        // Update route with path data
        route.path = path;
        await route.save();
      } else {
        return res.status(404).json({
          success: false,
          message: 'No path data available for this route'
        });
      }
    }
    
    // Return GeoJSON format for map display
    const geoJson = {
      type: 'Feature',
      properties: {
        name: route.name,
        difficulty: route.difficulty,
        roadType: route.roadType,
        totalDistance: route.stats.totalDistance,
        elevationGain: route.stats.elevationGain
      },
      geometry: {
        type: 'LineString',
        coordinates: route.path
      }
    };
    
    res.status(200).json({
      success: true,
      data: geoJson
    });
    
  } catch (error) {
    console.error('Error fetching route path:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route path',
      error: error.message
    });
  }
});

// GET a single bike route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await BikeRoute.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Bike route not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error fetching bike route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bike route',
      error: error.message
    });
  }
});

// POST create a new bike route
router.post('/', async (req, res) => {
  try {
    // Create a new route from request body
    const newRoute = new BikeRoute(req.body);
    const savedRoute = await newRoute.save();
    
    res.status(201).json({
      success: true,
      message: 'Bike route created successfully',
      data: savedRoute
    });
  } catch (error) {
    console.error('Error creating bike route:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create bike route',
      error: error.message
    });
  }
});

// POST upload and process a GPX file
router.post('/upload', upload.single('gpxFile'), async (req, res) => {
  try {
    console.log('GPX upload route hit');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No GPX file uploaded'
      });
    }
    
    const filePath = req.file.path;
    
    // Read the GPX file
    const gpxContent = fs.readFileSync(filePath, 'utf8');
    
    // Process GPX data to extract coordinates and stats
    const { path, stats } = await processGpxFile(gpxContent);
    
    // Create a new route with data from GPX
    const routeName = req.body.name || extractNameFromGpx(gpxContent) || req.file.originalname.replace('.gpx', '');
    
    // Calculate difficulty based on distance and elevation gain
    const difficulty = calculateDifficulty(stats.totalDistance, stats.elevationGain);
    
    const newRoute = new BikeRoute({
      name: routeName,
      description: req.body.description || `Bike route imported from ${req.file.originalname}`,
      fileName: req.file.filename,
      roadType: req.body.roadType || 'mixed',
      difficulty: req.body.difficulty || difficulty,
      path: path,
      stats: {
        totalDistance: stats.totalDistance,
        maxElevation: stats.maxElevation,
        minElevation: stats.minElevation,
        elevationGain: stats.elevationGain,
        numberOfPoints: path.length
      }
    });
    
    const savedRoute = await newRoute.save();
    
    res.status(201).json({
      success: true,
      message: 'GPX file uploaded and route created successfully',
      routeId: savedRoute._id,
      data: savedRoute
    });
  } catch (error) {
    console.error('Error uploading GPX file:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to process GPX file',
      error: error.message
    });
  }
});

// PUT update a bike route
router.put('/:id', async (req, res) => {
  try {
    const updatedRoute = await BikeRoute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedRoute) {
      return res.status(404).json({
        success: false,
        message: 'Bike route not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bike route updated successfully',
      data: updatedRoute
    });
  } catch (error) {
    console.error('Error updating bike route:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update bike route',
      error: error.message
    });
  }
});

// DELETE a bike route
router.delete('/:id', async (req, res) => {
  try {
    const route = await BikeRoute.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Bike route not found'
      });
    }
    
    // Delete associated GPX file if exists
    if (route.fileName) {
      const filePath = path.join(__dirname, '../uploads/gpx', route.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete the route
    await BikeRoute.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Bike route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bike route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bike route',
      error: error.message
    });
  }
});

// Function to process GPX file and extract path coordinates and stats
async function processGpxFile(gpxContent) {
  return new Promise((resolve, reject) => {
    try {
      // Parse GPX using gpx-parser
      const gpx = new gpxParser();
      gpx.parse(gpxContent);
      
      if (!gpx.tracks || gpx.tracks.length === 0) {
        return reject(new Error('No track data found in GPX file'));
      }
      
      const path = [];
      let totalDistance = 0;
      let elevationGain = 0;
      let lastElevation = null;
      let maxElevation = -Infinity;
      let minElevation = Infinity;
      
      // Process all tracks
      gpx.tracks.forEach(track => {
        track.points.forEach((point, index) => {
          const lon = point.lon;
          const lat = point.lat;
          const ele = point.ele || 0;
          
          // Calculate elevation gain
          if (lastElevation !== null && ele > lastElevation) {
            elevationGain += (ele - lastElevation);
          }
          lastElevation = ele;
          
          // Update min/max elevation
          maxElevation = Math.max(maxElevation, ele);
          minElevation = Math.min(minElevation, ele || 0);
          
          // Add point to path [longitude, latitude, elevation]
          if (ele) {
            path.push([lon, lat, ele]);
          } else {
            path.push([lon, lat]);
          }
        });
      });
      
      // Calculate total distance
      totalDistance = gpx.tracks.reduce((acc, track) => {
        return acc + track.distance.total;
      }, 0) / 1000; // Convert to kilometers
      
      resolve({
        path,
        stats: {
          totalDistance,
          elevationGain,
          maxElevation: isFinite(maxElevation) ? maxElevation : 0,
          minElevation: isFinite(minElevation) ? minElevation : 0,
          numberOfPoints: path.length
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Process GPX content directly to extract path data
async function processGpxData(gpxContent) {
  return new Promise((resolve, reject) => {
    try {
      // Convert GPX to GeoJSON using togeojson
      const gpxDoc = new DOMParser().parseFromString(gpxContent);
      const geoJson = toGeoJSON.gpx(gpxDoc);
      
      let path = [];
      
      // Extract coordinates from the GeoJSON
      if (geoJson.features && geoJson.features.length > 0) {
        // Find the first LineString feature (track)
        const trackFeature = geoJson.features.find(f => 
          f.geometry && f.geometry.type === 'LineString'
        );
        
        if (trackFeature && trackFeature.geometry.coordinates) {
          path = trackFeature.geometry.coordinates;
        }
      }
      
      resolve(path);
    } catch (error) {
      reject(error);
    }
  });
}

// Extract route name from GPX if available
function extractNameFromGpx(gpxContent) {
  try {
    const match = gpxContent.match(/<name>(.*?)<\/name>/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  } catch (error) {
    console.error('Error extracting name from GPX:', error);
    return null;
  }
}

// Helper function to calculate difficulty based on distance and elevation gain
function calculateDifficulty(distance, elevationGain) {
  // Simple algorithm to determine difficulty
  const difficultyScore = (distance * 0.3) + (elevationGain / 100);
  
  if (difficultyScore < 10) {
    return 'easy';
  } else if (difficultyScore < 30) {
    return 'medium';
  } else {
    return 'hard';
  }
}

module.exports = router;