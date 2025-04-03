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
      description_it,
      relevant_for // New field
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

    // Validate relevant_for if provided
    const validRelevantFor = ['Resident', 'Guest', 'Business'];
    if (relevant_for && !Array.isArray(relevant_for)) {
      // Convert comma-separated string to array
      const relevantForArray = relevant_for.split(',').map(item => item.trim());
      
      // Check if all values are valid
      const invalidValues = relevantForArray.filter(value => !validRelevantFor.includes(value));
      if (invalidValues.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid relevant_for values: ${invalidValues.join(', ')}. Must be one or more of: ${validRelevantFor.join(', ')}`
        });
      }
    }

    // Convert coordinates object to string if needed
    let coordsString = coordinates;
    if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
      coordsString = `${coordinates.lat}, ${coordinates.lng}`;
    }

    // Process relevant_for field if it's a comma-separated string
    let relevantForArray = relevant_for;
    if (typeof relevant_for === 'string') {
      relevantForArray = relevant_for.split(',').map(item => item.trim());
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
      description_it,
      relevant_for: relevantForArray
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
    const requiredFields = ['category', 'type_it', 'type_en', 'coordinates', 'name_en', 'name_it', 'relevant_for'];
    const validCategories = ['business', 'cultural', 'landscape', 'religious', 'landscape_religious'];
    const validRelevantFor = ['Resident', 'Guest', 'Business'];

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

      // Process and validate relevant_for field
      if (typeof poi.relevant_for === 'string') {
        // Convert comma-separated string to array
        poi.relevant_for = poi.relevant_for.split(',').map(item => item.trim());
      }

      // Validate relevant_for values
      if (!Array.isArray(poi.relevant_for)) {
        invalidPois.push({
          index: i + 1,
          reason: `Invalid relevant_for format. Must be an array or comma-separated string`,
          data: poi
        });
        continue;
      }

      // Check if all values in relevant_for array are valid
      const invalidValues = poi.relevant_for.filter(value => !validRelevantFor.includes(value));
      if (invalidValues.length > 0) {
        invalidPois.push({
          index: i + 1,
          reason: `Invalid relevant_for values: ${invalidValues.join(', ')}. Must be one or more of: ${validRelevantFor.join(', ')}`,
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
/**
 * @route   GET /api/pois
 * @desc    Get all POIs with optional filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Build query object
    const query = {};
    
    // Handle relevant_for filtering
    if (req.query.relevantFor) {
      // Convert comma-separated string to array
      const relevantForFilter = req.query.relevantFor.split(',').map(item => item.trim());
      
      // Validate the values
      const validRelevantFor = ['Resident', 'Guest', 'Business'];
      const invalidValues = relevantForFilter.filter(value => !validRelevantFor.includes(value));
      
      if (invalidValues.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid relevantFor values: ${invalidValues.join(', ')}. Must be one or more of: ${validRelevantFor.join(', ')}`
        });
      }
      
      // If only one value, find POIs that contain that value
      if (relevantForFilter.length === 1) {
        query.relevant_for = relevantForFilter[0];
      } 
      // If multiple values, find POIs that match any of the values (OR condition)
      else if (relevantForFilter.length > 1) {
        query.relevant_for = { $in: relevantForFilter };
      }
    }
    
    // Handle category filtering (if it exists in your current implementation)
    if (req.query.category) {
      const validCategories = ['business', 'cultural', 'landscape', 'religious', 'landscape_religious'];
      if (!validCategories.includes(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
      query.category = req.query.category;
    }
    
    // Handle type filtering
    if (req.query.type) {
      // Search in both type_en and type_it fields
      query.$or = [
        { type_en: req.query.type },
        { type_it: req.query.type }
      ];
    }
    
    // Execute the query
    const pois = await Poi.find(query).sort('-createdAt');

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
/**
 * @route   GET /api/pois/category/:category
 * @desc    Get POIs by category with optional relevance filtering
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
    
    // Build query object starting with the category
    const query = { category };
    
    // Handle relevant_for filtering if provided in query params
    if (req.query.relevantFor) {
      // Convert comma-separated string to array
      const relevantForFilter = req.query.relevantFor.split(',').map(item => item.trim());
      
      // Validate the values
      const validRelevantFor = ['Resident', 'Guest', 'Business'];
      const invalidValues = relevantForFilter.filter(value => !validRelevantFor.includes(value));
      
      if (invalidValues.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid relevantFor values: ${invalidValues.join(', ')}. Must be one or more of: ${validRelevantFor.join(', ')}`
        });
      }
      
      // If only one value, find POIs that contain that value
      if (relevantForFilter.length === 1) {
        query.relevant_for = relevantForFilter[0];
      } 
      // If multiple values, find POIs that match any of the values (OR condition)
      else if (relevantForFilter.length > 1) {
        query.relevant_for = { $in: relevantForFilter };
      }
    }
    
    const pois = await Poi.find(query).sort('-createdAt');

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
      description_it,
      relevant_for
    } = req.body;

    // Validate required fields
    if (!category || !type_it || !type_en || !coordinates || !name_en || !name_it || !relevant_for) {
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

    // Validate and process relevant_for
    let relevantForArray = relevant_for;
    const validRelevantFor = ['Resident', 'Guest', 'Business'];
    
    // Convert string to array if needed
    if (typeof relevant_for === 'string') {
      relevantForArray = relevant_for.split(',').map(item => item.trim());
    }
    
    // Validate relevant_for values
    if (!Array.isArray(relevantForArray)) {
      return res.status(400).json({
        success: false,
        message: 'relevant_for must be an array or comma-separated string'
      });
    }
    
    // Check if all values are valid
    const invalidValues = relevantForArray.filter(value => !validRelevantFor.includes(value));
    if (invalidValues.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid relevant_for values: ${invalidValues.join(', ')}. Must be one or more of: ${validRelevantFor.join(', ')}`
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
      description_it,
      relevant_for: relevantForArray
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
/**
 * @route   GET /api/pois/search/:query
 * @desc    Search POIs by text with optional relevance filtering
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    
    // Start with the text search query
    const baseQuery = {
      $text: { $search: searchQuery }
    };
    
    // Build final query object
    let finalQuery = { ...baseQuery };
    
    // Add relevant_for filtering if provided
    if (req.query.relevantFor) {
      // Convert comma-separated string to array
      const relevantForFilter = req.query.relevantFor.split(',').map(item => item.trim());
      
      // Validate the values
      const validRelevantFor = ['Resident', 'Guest', 'Business'];
      const invalidValues = relevantForFilter.filter(value => !validRelevantFor.includes(value));
      
      if (invalidValues.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid relevantFor values: ${invalidValues.join(', ')}. Must be one or more of: ${validRelevantFor.join(', ')}`
        });
      }
      
      // Add to query - find documents that match any of the specified values
      if (relevantForFilter.length === 1) {
        finalQuery.relevant_for = relevantForFilter[0];
      } else {
        finalQuery.relevant_for = { $in: relevantForFilter };
      }
    }
    
    // Execute the search with combined query
    const pois = await Poi.find(finalQuery)
      .sort({ score: { $meta: 'textScore' } });

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
      description_it: "Questo è un esempio di POI",
      relevant_for: "Resident, Guest, Business"
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
          { id: 'description_it', title: 'description_it' },
          { id: 'relevant_for', title: 'relevant_for' }
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