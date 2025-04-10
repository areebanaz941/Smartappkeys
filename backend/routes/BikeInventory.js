// bikeRoutes.js
// API routes for bike inventory management with image handling

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BikeModel, bikesInventory } = require('./bikesInventory');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/bikes');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'bike-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.'), false);
  }
};

// Initialize multer upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter
});

/**
 * @route   GET /api/bikes
 * @desc    Get all bikes
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: bikesInventory.length,
      data: bikesInventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/bikes/:id
 * @desc    Get single bike by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const bike = bikesInventory.find(bike => bike.id === req.params.id);
    
    if (!bike) {
      return res.status(404).json({
        success: false,
        error: 'Bike not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bike
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   POST /api/bikes
 * @desc    Add a new bike with images
 * @access  Private
 */
router.post('/', upload.array('images', 10), (req, res) => {
  try {
    const {
      name,
      description,
      price,
      details,
      setup,
      specifications,
      type
    } = req.body;

    // Create a unique ID (in production, you might use UUID)
    const typePrefix = type ? type.substring(0, 2).toUpperCase() : 'BK';
    const id = `${typePrefix}-${Date.now()}`;

    // Process uploaded files
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Create URL for the uploaded file
        const imageUrl = `/uploads/bikes/${file.filename}`;
        imageUrls.push(imageUrl);
      });
    }

    // Parse specifications if it's a JSON string
    let parsedSpecifications = specifications;
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        parsedSpecifications = {
          chassis: '',
          motor: '',
          battery: '',
          gearing: '',
          brakes: '',
          tires: '',
          display: '',
          handlebar: '',
          fork: ''
        };
      }
    }

    // Create new bike instance
    const newBike = new BikeModel({
      id,
      name,
      description,
      price: parseFloat(price) || 0,
      details,
      setup,
      specifications: parsedSpecifications,
      type: type || 'Bike',
      images: imageUrls,
      status: 'active'
    });

    // Add to inventory (in a real app, this would save to a database)
    bikesInventory.push(newBike);

    res.status(201).json({
      success: true,
      data: newBike
    });
  } catch (error) {
    console.error('Error adding bike:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   PUT /api/bikes/:id
 * @desc    Update a bike with possible image updates
 * @access  Private
 */
router.put('/:id', upload.array('images', 10), (req, res) => {
  try {
    const index = bikesInventory.findIndex(bike => bike.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Bike not found'
      });
    }

    const {
      name,
      description,
      price,
      details,
      setup,
      specifications,
      type,
      status,
      removeImages
    } = req.body;

    // Get existing bike data
    const existingBike = bikesInventory[index];
    
    // Process image removals if specified
    let updatedImageUrls = [...existingBike.images];
    if (removeImages) {
      const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      
      // Filter out images that should be removed
      updatedImageUrls = updatedImageUrls.filter(url => !imagesToRemove.includes(url));
      
      // Delete the actual files (optional, depends on your storage strategy)
      imagesToRemove.forEach(imageUrl => {
        const filePath = path.join(__dirname, '../public', imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // Process new uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Create URL for the uploaded file
        const imageUrl = `/uploads/bikes/${file.filename}`;
        updatedImageUrls.push(imageUrl);
      });
    }

    // Parse specifications if it's a JSON string
    let parsedSpecifications = specifications;
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        parsedSpecifications = existingBike.specifications;
      }
    }

    // Update bike with new data, preserving the ID
    const updatedBike = new BikeModel({
      id: req.params.id,
      name: name || existingBike.name,
      description: description || existingBike.description,
      price: price ? parseFloat(price) : existingBike.price,
      details: details || existingBike.details,
      setup: setup || existingBike.setup,
      specifications: parsedSpecifications || existingBike.specifications,
      type: type || existingBike.type,
      images: updatedImageUrls,
      status: status || existingBike.status
    });

    bikesInventory[index] = updatedBike;

    res.status(200).json({
      success: true,
      data: updatedBike
    });
  } catch (error) {
    console.error('Error updating bike:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   DELETE /api/bikes/:id
 * @desc    Delete a bike and its images
 * @access  Private
 */
router.delete('/:id', (req, res) => {
  try {
    const index = bikesInventory.findIndex(bike => bike.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Bike not found'
      });
    }

    // Get the bike's images to delete the files
    const bikeToDelete = bikesInventory[index];
    
    // Delete image files from storage
    if (bikeToDelete.images && bikeToDelete.images.length > 0) {
      bikeToDelete.images.forEach(imageUrl => {
        const filePath = path.join(__dirname, '../public', imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Remove bike from inventory
    bikesInventory.splice(index, 1);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting bike:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/bikes/type/:type
 * @desc    Get bikes by type (Bike, Cycle, Motorcycle)
 * @access  Public
 */
router.get('/type/:type', (req, res) => {
  try {
    const type = req.params.type;
    const filteredBikes = bikesInventory.filter(bike => 
      bike.type.toLowerCase() === type.toLowerCase()
    );

    res.status(200).json({
      success: true,
      count: filteredBikes.length,
      data: filteredBikes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/bikes/search
 * @desc    Search bikes by name or description
 * @access  Public
 */
router.get('/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchResults = bikesInventory.filter(bike => 
      bike.name.toLowerCase().includes(query.toLowerCase()) || 
      bike.description.toLowerCase().includes(query.toLowerCase())
    );

    res.status(200).json({
      success: true,
      count: searchResults.length,
      data: searchResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

/**
 * @route   GET /api/bikes/filter/price
 * @desc    Filter bikes by price range
 * @access  Public
 */
router.get('/filter/price', (req, res) => {
  try {
    const { min, max } = req.query;
    
    if (!min && !max) {
      return res.status(400).json({
        success: false,
        error: 'Min or max price parameter is required'
      });
    }

    let filteredBikes = [...bikesInventory];
    
    if (min) {
      filteredBikes = filteredBikes.filter(bike => bike.price >= parseFloat(min));
    }
    
    if (max) {
      filteredBikes = filteredBikes.filter(bike => bike.price <= parseFloat(max));
    }

    res.status(200).json({
      success: true,
      count: filteredBikes.length,
      data: filteredBikes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router;