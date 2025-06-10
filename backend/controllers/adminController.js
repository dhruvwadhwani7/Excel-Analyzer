const User = require('../models/User');
const File = require('../models/File');
const Chart = require('../models/Chart');
const fs = require('fs');

exports.getStats = async (req, res) => {
  try {
    // Use Promise.all for parallel execution
    const [
      usersCount,
      files,
      charts,
      fileAggregation,
      chartAggregation
    ] = await Promise.all([
      User.countDocuments({ role: 'regular' }),
      File.find().sort({ uploadDate: -1 }).limit(5).populate('userId', 'name email'),
      Chart.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email'),
      File.aggregate([
        {
          $group: {
            _id: null,
            totalStorage: { $sum: '$fileSize' },
            fileTypeCount: {
              $push: '$fileType'
            },
            statusCount: {
              $push: '$status'
            }
          }
        }
      ]),
      Chart.aggregate([
        {
          $group: {
            _id: '$chartType',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const fileData = fileAggregation[0] || { totalStorage: 0, fileTypeCount: [], statusCount: [] };
    const totalStorageMB = (fileData.totalStorage / (1024 * 1024)).toFixed(2);

    // Get detailed user information
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    // Get detailed file information
    const detailedFiles = await File.find()
      .populate('userId', 'name email')
      .sort({ uploadDate: -1 });

    // Get detailed chart information
    const detailedCharts = await Chart.find()
      .populate('userId', 'name email')
      .populate('fileId', 'fileName')
      .sort({ createdAt: -1 });

    // Calculate total storage in bytes
    const totalStorage = detailedFiles.reduce((acc, file) => acc + file.fileSize, 0);

    const stats = {
      summary: {
        users: usersCount,
        files: fileData.fileTypeCount.length,
        charts: chartAggregation.reduce((sum, type) => sum + type.count, 0),
        storage: totalStorage // Now in bytes for precise calculation
      },
      fileStats: {
        types: {
          csv: fileData.fileTypeCount.filter(t => t === 'csv').length,
          xlsx: fileData.fileTypeCount.filter(t => t === 'xlsx').length,
          xls: fileData.fileTypeCount.filter(t => t === 'xls').length
        },
        status: {
          processed: fileData.statusCount.filter(s => s === 'processed').length,
          processing: fileData.statusCount.filter(s => s === 'processing').length,
          failed: fileData.statusCount.filter(s => s === 'failed').length
        }
      },
      chartStats: {
        types: chartAggregation.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {})
      },
      recentActivity: {
        files: files.map(file => ({
          id: file._id,
          name: file.fileName,
          type: file.fileType,
          size: (file.fileSize / 1024).toFixed(2) + ' KB',
          user: file.userId?.name || 'Unknown User',
          date: file.uploadDate
        })),
        charts: charts.map(chart => ({
          id: chart._id,
          type: chart.chartType,
          title: chart.title || 'Untitled Chart',
          user: chart.userId?.name || 'Unknown User',
          date: chart.createdAt
        }))
      },
      detailedData: {
        users,
        files: detailedFiles,
        charts: detailedCharts
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching admin statistics' 
    });
  }
};

exports.deleteFile = async (req, res) => {
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

    // Delete physical file if it exists
    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();
    res.json({ success: true, message: 'File and associated charts deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting file'
    });
  }
};

exports.deleteChart = async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id);
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    await chart.deleteOne();
    res.json({ success: true, message: 'Chart deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting chart'
    });
  }
};
