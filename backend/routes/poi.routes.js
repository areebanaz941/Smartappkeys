// routes/poi.routes.js
const express = require('express');
const router = express.Router();
const Poi = require('../models/POI');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Setup for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/temp');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

/**
 * @route   POST /api/pois
 * @desc    Create a new POI manually
 * @access  Private (Admin only)
 */
router.post('/', async (req, res) => {
  try {
    const {
      category,
      type_it,
      type_en,
      coordinates,
      photo,
      name_en,
      description_en,
      name_it,
      description_it
    } = req.body;

    // Validate required fields
    if (!category || !type_it || !type_en || !coordinates || !name_en || !name_it) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Validate category
    const validCategories = ['business', 'cultural', 'landscape', 'religious', 'landscape_religious'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Convert coordinates object to string if needed
    let coordsString = coordinates;
    if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
      coordsString = `${coordinates.lat}, ${coordinates.lng}`;
    }

    // Create POI
    const poi = new Poi({
      category,
      type_it,
      type_en,
      coordinates: coordsString,
      photo,
      name_en,
      description_en,
      name_it,
      description_it
    });

    const savedPoi = await poi.save();

    return res.status(201).json({
      success: true,
      message: 'POI created successfully',
      data: savedPoi
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/pois/bulk
 * @desc    Import POIs from CSV or JSON
 * @access  Private (Admin only)
 */
router.post('/bulk', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    let results = [];
    
    // Handle CSV files
    if (fileExt === '.csv') {
      results = await new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve(rows))
          .on('error', (error) => reject(error));
      });
    } 
    // Handle JSON files
    else if (fileExt === '.json') {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(fileContent);
      results = Array.isArray(parsedData) ? parsedData : [parsedData];
    } 
    else {
      // Clean up
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Please upload a CSV or JSON file.'
      });
    }

    // Validate each POI
    const invalidPois = [];
    const validPois = [];
    const requiredFields = ['category', 'type_it', 'type_en', 'coordinates', 'name_en', 'name_it'];
    const validCategories = ['business', 'cultural', 'landscape', 'religious', 'landscape_religious'];

    for (let i = 0; i < results.length; i++) {
      const poi = results[i];
      
      // Check for required fields
      const missingFields = requiredFields.filter(field => !poi[field]);
      
      if (missingFields.length > 0) {
        invalidPois.push({
          index: i + 1,
          reason: `Missing required fields: ${missingFields.join(', ')}`,
          data: poi
        });
        continue;
      }

      // Validate category
      if (!validCategories.includes(poi.category)) {
        invalidPois.push({
          index: i + 1,
          reason: `Invalid category: ${poi.category}. Must be one of: ${validCategories.join(', ')}`,
          data: poi
        });
        continue;
      }

      // Convert coordinates to string if needed
      if (typeof poi.coordinates === 'object' && poi.coordinates.lat && poi.coordinates.lng) {
        poi.coordinates = `${poi.coordinates.lat}, ${poi.coordinates.lng}`;
      }

      validPois.push(poi);
    }

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    // Check if all POIs are invalid
    if (validPois.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid POIs found in the file',
        invalidPois
      });
    }

    // Process POIs (update if ID exists, create if not)
    const processedResults = {
      created: 0,
      updated: 0,
      failed: 0,
      details: []
    };

    for (const poi of validPois) {
      try {
        // Check if POI has an ID and exists in the database
        if (poi._id) {
          const existingPoi = await Poi.findById(poi._id);
          
          if (existingPoi) {
            // Update existing POI
            const updatedPoi = await Poi.findByIdAndUpdate(poi._id, poi, { 
              new: true, 
              runValidators: true 
            });
            
            processedResults.updated++;
            processedResults.details.push({
              action: 'updated',
              id: updatedPoi._id,
              name: updatedPoi.name_en
            });
          } else {
            // ID provided but not found, create new
            delete poi._id; // Remove invalid ID before creating
            const newPoi = new Poi(poi);
            await newPoi.save();
            
            processedResults.created++;
            processedResults.details.push({
              action: 'created',
              id: newPoi._id,
              name: newPoi.name_en
            });
          }
        } else {
          // No ID provided, always create new
          const newPoi = new Poi(poi);
          await newPoi.save();
          
          processedResults.created++;
          processedResults.details.push({
            action: 'created',
            id: newPoi._id,
            name: newPoi.name_en
          });
        }
      } catch (error) {
        processedResults.failed++;
        processedResults.details.push({
          action: 'failed',
          name: poi.name_en,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${validPois.length} POIs: ${processedResults.created} created, ${processedResults.updated} updated, ${processedResults.failed} failed`,
      results: processedResults,
      invalidCount: invalidPois.length,
      invalidPois: invalidPois.length > 0 ? invalidPois : undefined
    });
  } catch (err) {
    console.error('Server error during bulk import:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during bulk import',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/pois
 * @desc    Get all POIs
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const pois = await Poi.find().sort('-createdAt');

    return res.status(200).json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/pois/category/:category
 * @desc    Get POIs by category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const validCategories = ['business', 'cultural', 'landscape', 'religious', 'landscape_religious'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }
    
    const pois = await Poi.find({ category }).sort('-createdAt');

    return res.status(200).json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/pois/:id
 * @desc    Get POI by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const poi = await Poi.findById(req.params.id);

    if (!poi) {
      return res.status(404).json({ 
        success: false,
        message: 'POI not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: poi
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/pois/:id
 * @desc    Update POI by ID
 * @access  Private (Admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      category,
      type_it,
      type_en,
      coordinates,
      photo,
      name_en,
      description_en,
      name_it,
      description_it
    } = req.body;

    // Validate required fields
    if (!category || !type_it || !type_en || !coordinates || !name_en || !name_it) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Validate category
    const validCategories = ['business', 'cultural', 'landscape', 'religious', 'landscape_religious'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Format coordinates for storage if needed
    let coordsString = coordinates;
    if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
      coordsString = `${coordinates.lat}, ${coordinates.lng}`;
    }

    // Create update object
    const updateData = {
      category,
      type_it,
      type_en,
      coordinates: coordsString,
      photo,
      name_en,
      description_en,
      name_it,
      description_it
    };

    // Update POI
    const poi = await Poi.findByIdAndUpdate(req.params.id, updateData, { 
      new: true,
      runValidators: true
    });

    if (!poi) {
      return res.status(404).json({ 
        success: false,
        message: 'POI not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'POI updated successfully',
      data: poi
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   DELETE /api/pois/:id
 * @desc    Delete POI by ID
 * @access  Private (Admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const poi = await Poi.findByIdAndDelete(req.params.id);

    if (!poi) {
      return res.status(404).json({ 
        success: false,
        message: 'POI not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'POI deleted successfully'
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/pois/search/:query
 * @desc    Search POIs by text
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const pois = await Poi.find({ 
      $text: { $search: searchQuery } 
    }).sort({ score: { $meta: 'textScore' } });

    return res.status(200).json({
      success: true,
      count: pois.length,
      data: pois
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/pois/template/download/:format
 * @desc    Download template for POI import (CSV or JSON)
 * @access  Public
 */
router.get('/template/download/:format', (req, res) => {
  try {
    const format = req.params.format.toLowerCase();
    
    if (format !== 'csv' && format !== 'json') {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Please use csv or json.'
      });
    }

    const sampleData = [{
      _id: "",
      category: "cultural",
      type_it: "Culturale",
      type_en: "Cultural",
      coordinates: "42.6851326966809, 11.907076835632326",
      photo: "https://example.com/image.jpg",
      name_en: "Example POI",
      description_en: "This is an example POI",
      name_it: "Esempio POI",
      description_it: "Questo è un esempio di POI"
    }];

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=poi_template.json');
      return res.send(JSON.stringify(sampleData, null, 2));
    } else {
      // Convert to CSV
      const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
      const csvStringifier = createCsvStringifier({
        header: [
          { id: '_id', title: '_id' },
          { id: 'category', title: 'category' },
          { id: 'type_it', title: 'type_it' },
          { id: 'type_en', title: 'type_en' },
          { id: 'coordinates', title: 'coordinates' },
          { id: 'photo', title: 'photo' },
          { id: 'name_en', title: 'name_en' },
          { id: 'description_en', title: 'description_en' },
          { id: 'name_it', title: 'name_it' },
          { id: 'description_it', title: 'description_it' }
        ]
      });

      const csvHeader = csvStringifier.getHeaderString();
      const csvRecords = csvStringifier.stringifyRecords(sampleData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=poi_template.csv');
      return res.send(csvHeader + csvRecords);
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;