const Chart = require('../models/Chart');
const File = require('../models/File');

class CleanupService {
  static async cleanupOrphanedCharts() {
    try {
      // Find all charts
      const charts = await Chart.find({});
      
      for (const chart of charts) {
        // Check if associated file exists
        const file = await File.findById(chart.fileId);
        if (!file) {
          // Delete chart if file doesn't exist
          await Chart.deleteOne({ _id: chart._id });
          console.log(`Deleted orphaned chart: ${chart._id}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned charts:', error);
    }
  }
}

module.exports = CleanupService;
