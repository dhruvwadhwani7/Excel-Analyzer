const cron = require('node-cron');
const CleanupService = require('./cleanupService');

class CleanupScheduler {
  static init() {
    // Run cleanup every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled cleanup...');
      await CleanupService.cleanupOrphanedCharts();
    });
  }
}

module.exports = CleanupScheduler;
