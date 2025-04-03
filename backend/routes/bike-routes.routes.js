// routes/bike-routes.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const BikeRoute = require('../models/BikeRoute');
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
    
    // Filter by min/max distance
    if (req.query.minDistance) {
      filter.distance = { $gte: parseFloat(req.query.minDistance) };
    }
    if (req.query.maxDistance) {
      if (filter.distance) {
        filter.distance.$lte = parseFloat(req.query.maxDistance);
      } else {
        filter.distance = { $lte: parseFloat(req.query.maxDistance) };
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
    if (!route.gpxFile) {
      return res.status(404).json({
        success: false,
        message: 'No GPX file associated with this route'
      });
    }
    
    const filePath = path.join(__dirname, '../uploads/gpx', route.gpxFile);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'GPX file not found on server'
      });
    }
    
    // Set content type for GPX files
    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${route.gpxFile}"`);
    
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
      if (route.gpxFile) {
        const filePath = path.join(__dirname, '../uploads/gpx', route.gpxFile);
        
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
        distance: route.distance,
        elevationGain: route.elevationGain,
        estimatedTime: route.estimatedTime
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
    
    // Track popularity by incrementing view count
    route.popularity += 1;
    await route.save();
    
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
    
    const newRoute = new BikeRoute({
      name: routeName,
      description: req.body.description || `Bike route imported from ${req.file.originalname}`,
      difficulty: req.body.difficulty || calculateDifficulty(stats.distance, stats.elevationGain),
      distance: Math.round(stats.distance * 10) / 10, // Round to 1 decimal place
      elevationGain: Math.round(stats.elevationGain),
      estimatedTime: req.body.estimatedTime || calculateEstimatedTime(stats.distance, stats.elevationGain),
      startPoint: req.body.startPoint || stats.startPoint || 'From GPX',
      endPoint: req.body.endPoint || stats.endPoint || 'From GPX',
      tags: req.body.tags || ['imported'],
      isPublic: req.body.hasOwnProperty('isPublic') ? req.body.isPublic : true,
      gpxFile: req.file.filename,
      path: path
    });
    
    const savedRoute = await newRoute.save();
    
    res.status(201).json({
      success: true,
      message: 'GPX file uploaded and route created successfully',
      stats: {
        distance: savedRoute.distance,
        elevationGain: savedRoute.elevationGain,
        estimatedTime: savedRoute.estimatedTime,
        numberOfPoints: path.length
      },
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
    if (route.gpxFile) {
      const filePath = path.join(__dirname, '../uploads/gpx', route.gpxFile);
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
      gpxParser.parseGpx(gpxContent, (error, data) => {
        if (error) {
          return reject(new Error(`Error parsing GPX: ${error.message}`));
        }
        
        if (!data || !data.tracks || data.tracks.length === 0) {
          return reject(new Error('No track data found in GPX file'));
        }
        
        const path = [];
        let totalDistance = 0;
        let elevationGain = 0;
        let lastElevation = null;
        let lastLat = null;
        let lastLon = null;
        let maxElevation = -Infinity;
        let minElevation = Infinity;
        let startPoint = null;
        let endPoint = null;
        
        // Process all tracks
        data.tracks.forEach(track => {
          // Process track segments
          track.segments.forEach(segment => {
            segment.forEach((point, index) => {
              const lon = parseFloat(point.lon);
              const lat = parseFloat(point.lat);
              const ele = point.ele ? parseFloat(point.ele) : 0;
              
              // Store first point as start point
              if (index === 0 && !startPoint) {
                startPoint = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
              }
              
              // Update end point with each new point
              endPoint = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
              
              // Calculate elevation gain
              if (lastElevation !== null && ele > lastElevation) {
                elevationGain += (ele - lastElevation);
              }
              lastElevation = ele;
              
              // Update min/max elevation
              maxElevation = Math.max(maxElevation, ele);
              minElevation = Math.min(minElevation, ele);
              
              // Calculate distance from last point
              if (lastLat !== null && lastLon !== null) {
                const dist = calculateDistance(lastLat, lastLon, lat, lon);
                totalDistance += dist;
              }
              lastLat = lat;
              lastLon = lon;
              
              // Add point to path [longitude, latitude, elevation]
              path.push([lon, lat, ele]);
            });
          });
        });
        
        // Convert distance to kilometers
        totalDistance = totalDistance / 1000;
        
        // Calculate estimated time (minutes) based on distance and elevation gain
        const estimatedTime = calculateEstimatedTime(totalDistance, elevationGain);
        
        resolve({
          path,
          stats: {
            distance: totalDistance,
            elevationGain,
            maxElevation,
            minElevation,
            estimatedTime,
            numberOfPoints: path.length,
            startPoint,
            endPoint
          }
        });
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

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
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

// Helper function to calculate estimated time based on distance and elevation gain
function calculateEstimatedTime(distance, elevationGain) {
  // Base time calculation in minutes
  // Assume average cycling speed of 15 km/h on flat terrain
  const baseTime = (distance / 15) * 60;
  
  // Add time for elevation gain (approximately 1 minute per 10m of climbing)
  const climbingTime = elevationGain / 10;
  
  // Total estimated time
  return Math.max(1, Math.round(baseTime + climbingTime));
}

module.exports = router;