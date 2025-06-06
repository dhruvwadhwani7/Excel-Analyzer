const mongoose = require('mongoose');
const File = require('../models/File');
const Chart = require('../models/Chart');

const setupMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Ensure TTL indexes are properly set
    await Promise.all([
      File.collection.dropIndexes(),
      Chart.collection.dropIndexes()
    ]);

    await Promise.all([
      File.collection.createIndex(
        { uploadDate: 1 },
        { expireAfterSeconds: 43200, background: true }
      ),
      Chart.collection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 43200, background: true }
      )
    ]);

    console.log('TTL indexes recreated successfully');
  } catch (error) {
    console.error('MongoDB setup error:', error);
    process.exit(1);
  }
};

module.exports = setupMongoDB;
