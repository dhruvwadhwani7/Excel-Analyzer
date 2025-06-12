const File = require('../models/File');
const Chart = require('../models/Chart');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate stats for files
    const fileStats = await File.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          totalRows: { $sum: '$rowCount' },
          avgProcessingTime: { $avg: '$processingTime' },
          maxProcessingTime: { $max: '$processingTime' },
          minProcessingTime: { $min: '$processingTime' },
          dataTypes: {
            $push: '$columnTypes'
          }
        }
      }
    ]);

    // Aggregate stats for charts
    const chartStats = await Chart.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalCharts: { $sum: 1 },
          activeCharts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          chartTypes: {
            $push: '$chartType'
          }
        }
      }
    ]);

    // Process data types
    const dataTypes = {
      numeric: 0,
      text: 0,
      date: 0
    };

    fileStats[0]?.dataTypes.forEach(types => {
      Object.values(types).forEach(type => {
        if (type.includes('number')) dataTypes.numeric++;
        else if (type.includes('date')) dataTypes.date++;
        else dataTypes.text++;
      });
    });

    res.json({
      success: true,
      stats: {
        files: fileStats[0] || {},
        charts: chartStats[0] || {},
        dataTypes,
        avgProcessingTime: (fileStats[0]?.avgProcessingTime || 0).toFixed(2),
        fastestProcessing: (fileStats[0]?.minProcessingTime || 0).toFixed(2),
        slowestProcessing: (fileStats[0]?.maxProcessingTime || 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};
