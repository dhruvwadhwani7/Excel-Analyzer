const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authController = require('./controllers/auth');
const { protect } = require('./middleware/auth');
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const File = require('./models/File');
const Chart = require('./models/Chart');
const { getISTTime, formatISTDate, getExpiryTime } = require('./utils/timeUtils');
const setupMongoDB = require('./config/mongodb');
const { adminOnly } = require('./middleware/admin');
const adminController = require('./controllers/adminController');

const app = express();

// Update CORS configuration
app.use(cors({
  origin: ['http://localhost:5173' , 'https://excelanalyzer.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Initialize TTL cleanup after MongoDB connection
setupMongoDB()
  .then(async () => {
    console.log('Connected to MongoDB');
    const File = require('./models/File');
    await File.setupTTLCleanup();
    console.log('File TTL cleanup initialized');
  })
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
!fs.existsSync(uploadsDir) && fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp, random string and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `file-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel and CSV files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Increase to 50MB
});

// File upload route with error handling
app.post('/api/files/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    let parsedData = [];
    let columns = [];
    let preview = [];

    // Parse Excel/CSV file
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      
      const worksheet = workbook.worksheets[0];
      columns = worksheet.getRow(1).values.slice(1); // Get headers, skip first empty cell

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[columns[colNumber - 1]] = cell.value;
        });
        parsedData.push(rowData);
        if (rowNumber <= 11) { // Get first 10 rows for preview (after header)
          preview.push(rowData);
        }
      });
    } else if (ext === '.csv') {
      const workbook = new ExcelJS.Workbook();
      await workbook.csv.readFile(req.file.path);
      
      const worksheet = workbook.worksheets[0];
      columns = worksheet.getRow(1).values.slice(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[columns[colNumber - 1]] = cell.value;
        });
        parsedData.push(rowData);
        if (rowNumber <= 11) {
          preview.push(rowData);
        }
      });
    }

    // Create file document
    const file = new File({
      fileName: req.file.originalname,
      fileType: ext.slice(1),
      fileSize: req.file.size,
      userId: req.user._id,
      status: 'processing',
      fileData: parsedData,
      preview,
      columns,
      rowCount: parsedData.length,
      filePath: req.file.path
    });

    await file.save();

    // Process file async
    setTimeout(async () => {
      try {
        file.status = 'processed';
        await file.save();
      } catch (err) {
        console.error('Error updating file status:', err);
      }
    }, 2000);

    res.json({ 
      success: true, 
      file: {
        _id: file._id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        status: file.status,
        uploadDate: file.uploadDate,
        columns,
        rowCount: parsedData.length,
        preview
      }
    });
  } catch (error) {
    // Only delete file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ 
      success: false, 
      message: error.message || 'File upload failed'
    });
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

    // Delete associated charts first
    await Chart.deleteMany({ fileId: file._id });

    // Delete physical file if it exists
    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();
    res.json({ success: true, message: 'File and associated charts deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add route to get file data
app.get('/api/files/:fileId/data', protect, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.fileId,
      userId: req.user._id 
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: {
        columns: file.columns,
        rows: file.fileData,
        preview: file.preview
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update the chart expiry endpoint
app.get('/api/charts/:chartId/expiry', protect, async (req, res) => {
  try {
    const chart = await Chart.findOne({ 
      _id: req.params.chartId,
      userId: req.user._id 
    });

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    const createdAtIST = getISTTime(chart.createdAt);
    const expiryTime = getExpiryTime(chart.createdAt);
    const now = getISTTime(new Date());
    const remainingTime = expiryTime - now;

    res.json({
      success: true,
      data: {
        createdAt: formatISTDate(chart.createdAt),
        expiryTime: formatISTDate(expiryTime),
        remainingTime,
        isExpired: remainingTime <= 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update file stats endpoint to include IST times
app.get('/api/files/stats', protect, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id });
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((acc, file) => acc + file.fileSize, 0),
      fileTypes: {
        xlsx: files.filter(f => f.fileType === 'xlsx').length,
        xls: files.filter(f => f.fileType === 'xls').length,
        csv: files.filter(f => f.fileType === 'csv').length
      },
      processingStatus: {
        processed: files.filter(f => f.status === 'processed').length,
        processing: files.filter(f => f.status === 'processing').length,
        failed: files.filter(f => f.status === 'failed').length
      },
      recentFiles: files.slice(0, 5).map(file => ({
        _id: file._id,
        fileName: file.fileName,
        fileType: file.fileType,
        status: file.status,
        uploadDate: formatISTDate(file.uploadDate),
        size: file.fileSize
      }))
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Chart routes
app.post('/api/chart/save-temp', protect, async (req, res) => {
  try {
    const { chartType, title, data, xAxis, yAxis, zAxis, dimension, fileId, dataPreview, image } = req.body;
    
    // Log received data for debugging
    console.log('Received chart data:', {
      chartType,
      dataLength: data?.length,
      hasData: !!data,
      isArray: Array.isArray(data)
    });

    // Enhanced validation
    if (!chartType || !xAxis || !yAxis) {
      return res.status(400).json({
        success: false,
        message: 'Missing required chart parameters (type, axes)'
      });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chart data is required and must be an array'
      });
    }

    // Validate data format
    const validData = data.every(point => 
      point && typeof point === 'object' && 
      'x' in point && 'y' in point &&
      (dimension !== '3d' || 'z' in point)
    );

    if (!validData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format - each point must have x, y (and z for 3D) coordinates'
      });
    }

    // Create and save chart
    const chart = new Chart({
      userId: req.user._id,
      fileId,
      chartType,
      title: title || 'Untitled Chart',
      data,
      xAxis,
      yAxis,
      zAxis,
      dimension,
      dataPreview: dataPreview?.slice(0, 10) || [],
      image,
      chartConfig: {
        chartType,
        dimension,
        xAxis,
        yAxis,
        zAxis,
        title
      }
    });
    
    await chart.save();

    res.json({ 
      success: true, 
      chart: {
        _id: chart._id,
        title: chart.title,
        chartType: chart.chartType,
        dimension: chart.dimension,
        createdAt: chart.createdAt
      }
    });
  } catch (error) {
    console.error('Chart save error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error saving chart'
    });
  }
});

// Get saved chart configuration - improved error handling
app.get('/api/chart/:chartId', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chartId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chart ID format'
      });
    }

    const chart = await Chart.findOne({
      _id: req.params.chartId,
      userId: req.user._id
    }).lean();

    if (!chart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chart configuration not found or expired' 
      });
    }

    // Ensure all required fields are present
    if (!chart.chartType || !chart.data) {
      return res.status(500).json({
        success: false,
        message: 'Invalid chart configuration'
      });
    }

    res.json({ success: true, chart });
  } catch (error) {
    console.error('Chart fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error while fetching chart'
    });
  }
});

// Fix the route path for saved charts
app.get('/api/charts/saved', protect, async (req, res) => {
  try {
    const charts = await Chart.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('title chartType dimension createdAt image');
      
    res.json({ success: true, charts });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Add new endpoint for chart statistics
app.get('/api/charts/stats', protect, async (req, res) => {
  try {
    const charts = await Chart.find({ userId: req.user._id });
    
    const stats = {
      totalCharts: charts.length,
      dimensions: {
        '2d': charts.filter(c => c.dimension === '2d').length,
        '3d': charts.filter(c => c.dimension === '3d').length
      },
      chartTypes: {
        bar: charts.filter(c => c.chartType === 'bar').length,
        line: charts.filter(c => c.chartType === 'line').length,
        pie: charts.filter(c => c.chartType === 'pie').length,
        column3d: charts.filter(c => c.chartType === 'column3d').length,
        bar3d: charts.filter(c => c.chartType === 'bar3d').length,
        line3d: charts.filter(c => c.chartType === 'line3d').length,
        scatter3d: charts.filter(c => c.chartType === 'scatter3d').length,
        area3d: charts.filter(c => c.chartType === 'area3d').length
      },
      recentCharts: charts.slice(0, 5).map(chart => ({
        _id: chart._id,
        title: chart.title || 'Untitled Chart',
        chartType: chart.chartType,
        dimension: chart.dimension,
        createdAt: chart.createdAt,
        xAxis: chart.xAxis,
        yAxis: chart.yAxis,
        zAxis: chart.zAxis
      }))
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all charts for a user
app.get('/api/charts/all', protect, async (req, res) => {
  try {
    const charts = await Chart.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('fileId', 'fileName'); // Include file name info
    res.json({ success: true, charts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete chart route
app.delete('/api/charts/:chartId', protect, async (req, res) => {
  try {
    const chart = await Chart.findOne({ 
      _id: req.params.chartId,
      userId: req.user._id 
    });

    if (!chart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chart not found or unauthorized' 
      });
    }

    await chart.deleteOne();
    res.json({ success: true, message: 'Chart deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add this new route before the server.listen line
app.get('/api/files/:fileId/preview', protect, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.fileId,
      userId: req.user._id 
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: {
        columns: file.columns,
        preview: file.preview || file.fileData.slice(0, 10), // Show first 10 rows if preview not available
        fileName: file.fileName,
        totalRows: file.rowCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin routes
app.get('/api/admin/stats', protect, adminOnly, adminController.getStats);

// Admin delete routes with improved error handling
app.delete('/api/admin/files/:id', protect, adminOnly, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete associated charts first
    await Chart.deleteMany({ fileId: file._id });

    // Delete physical file
    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();
    
    res.json({
      success: true,
      message: 'File and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file: ' + error.message
    });
  }
});

app.delete('/api/admin/charts/:id', protect, adminOnly, async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);
    
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    await chart.deleteOne();
    
    res.json({
      success: true,
      message: 'Chart deleted successfully'
    });
  } catch (error) {
    console.error('Delete chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting chart: ' + error.message
    });
  }
});

app.delete('/api/admin/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await mongoose.model('User').findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all user's files and their associated charts
    const userFiles = await File.find({ userId: user._id });
    for (const file of userFiles) {
      if (file.filePath && fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
      await Chart.deleteMany({ fileId: file._id });
      await file.deleteOne();
    }

    // Delete all user's charts
    await Chart.deleteMany({ userId: user._id });

    // Finally delete the user
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user: ' + error.message
    });
  }
});

// Add this new route for token verification
app.get('/api/user/profile', protect, async (req, res) => {
  try {
    // Since protect middleware already verifies the token, 
    // we just need to send back a success response
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phoneNumber: req.user.phoneNumber
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
