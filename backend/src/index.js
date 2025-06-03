const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authController = require('./controllers/auth');
const { protect } = require('./middleware/auth');
const multer = require('multer');
const File = require('./models/File');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Protected route example
app.get('/api/user/profile', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Update user name
app.put('/api/user/update-name', protect, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await mongoose.model('User').findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update multer config to use memory storage instead of disk storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// File upload route
app.post('/api/files/upload', protect, upload.single('file'), async (req, res) => {
  try {
    // Create file document with file metadata only
    const file = new File({
      fileName: req.file.originalname,
      fileType: req.file.originalname.split('.').pop().toLowerCase(),
      fileSize: req.file.size,
      userId: req.user._id,
      status: 'processing',
      fileData: req.file.buffer // Store file buffer in MongoDB
    });

    await file.save();

    // Simulate processing
    setTimeout(async () => {
      file.status = 'processed';
      await file.save();
    }, 2000);

    res.json({ 
      success: true, 
      file: {
        _id: file._id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        status: file.status,
        uploadDate: file.uploadDate
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user's files with limit
app.get('/api/files', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const files = await File.find({ userId: req.user._id })
      .sort({ uploadDate: -1 })
      .limit(limit);
    res.json({ success: true, files });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all files for a user
app.get('/api/files/all', protect, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id })
      .sort({ uploadDate: -1 });
    res.json({ success: true, files });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete file route
app.delete('/api/files/:fileId', protect, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.fileId,
      userId: req.user._id 
    });

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found or unauthorized' 
      });
    }

    await file.deleteOne();
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
