require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const heicConvert = require('heic-convert');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 5000;
const uploadDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
!fs.existsSync(uploadDir) && fs.mkdirSync(uploadDir, { recursive: true });

// Updated CORS configuration for production
// Updated CORS configuration for production
app.use(cors({
  origin: 'http://localhost:3000', // Only allow this domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Increased payload limits for large files
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Serve static files
app.use('/uploads', express.static(uploadDir));

// MongoDB connection with error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin_greatroads:great1234roads@cluster0.pvpvx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema definitions remain the same
const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  State: { type: String, required: true },
  description: String,
  gpxFile: {
    filename: String,
    path: String,
    contentType: String
  },
  images: [{
    filename: String,
    path: String,
    contentType: String,
    thumbnailPath: String
  }]
}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);

// HEIC conversion utility
async function convertHeicToJpg(buffer) {
  try {
    const jpgBuffer = await heicConvert({
      buffer: buffer,
      format: 'PNG',
      quality: 1
    });
    return jpgBuffer;
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw error;
  }
}

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Routes
app.get('/api/routes', async (req, res) => {
  try {
    const routes = await Route.find().sort('-createdAt');
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/routes/:id', async (req, res) => {
  try {
    console.log('Fetching route with ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid route ID format' });
    }

    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/routes', upload.fields([
  { name: 'gpxFile', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), async (req, res) => {
  try {
    const imagesData = [];
    
    if (req.files.images) {
      for (const file of req.files.images) {
        let imageBuffer = file.buffer;
        
        if (file.mimetype === 'image/heic' || file.originalname.toLowerCase().endsWith('.heic')) {
          imageBuffer = await convertHeicToJpg(file.buffer);
        }
        
        const timestamp = Date.now();
        const filename = `${timestamp}-${path.parse(file.originalname).name}.png`;
        const thumbnailFilename = `${timestamp}-thumb-${path.parse(file.originalname).name}.png`;
        
        await sharp(imageBuffer)
          .resize(2000, 1500, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 100 })
          .toFile(path.join(uploadDir, filename));
          
        await sharp(imageBuffer)
          .resize(800, 600, { fit: 'inside' })
          .png({ quality: 90 })
          .toFile(path.join(uploadDir, thumbnailFilename));

        imagesData.push({
          filename,
          path: `uploads/${filename}`,
          thumbnailPath: `uploads/${thumbnailFilename}`,
          contentType: 'image/png'
        });
      }
    }

    const gpxFile = req.files?.gpxFile?.[0];
    const gpxPath = gpxFile ? `uploads/${Date.now()}-${gpxFile.originalname}` : null;

    if (gpxFile) {
      await fs.promises.writeFile(path.join(__dirname, gpxPath), gpxFile.buffer);
    }

    const route = new Route({
      name: req.body.name,
      city: req.body.city,
      State: req.body.State,
      description: req.body.description,
      gpxFile: gpxFile ? {
        filename: gpxFile.originalname,
        path: gpxPath,
        contentType: gpxFile.mimetype
      } : null,
      images: imagesData
    });

    const savedRoute = await route.save();
    res.status(201).json({ success: true, route: savedRoute });
  } catch (error) {
    console.error('Error saving route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
