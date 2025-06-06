const fs = require('fs');
const path = require('path');
const File = require('../models/File');

const cleanupExpiredFiles = async () => {
  try {
    const expiredFiles = await File.find({
      uploadDate: { 
        $lt: new Date(Date.now() - 43200 * 1000) // 12 hours ago
      }
    });

    for (const file of expiredFiles) {
      if (file.filePath && fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
      await file.deleteOne();
    }

    console.log(`Cleaned up ${expiredFiles.length} expired files`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

module.exports = cleanupExpiredFiles;
