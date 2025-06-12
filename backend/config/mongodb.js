const mongoose = require('mongoose');
const File = require('../models/File');
const Chart = require('../models/Chart');

const setupMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Ensure indexes are properly set
    await Promise.all([
      File.collection.createIndex(
        { uploadDate: 1 },
        { expireAfterSeconds: 43200, background: true }
      ),
      Chart.collection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 43200, background: true }
      ),
      // Add indexes for admin queries
      File.collection.createIndex({ status: 1 }),
      Chart.collection.createIndex({ chartType: 1 }),
      File.collection.createIndex({ fileType: 1 })
    ]);

    console.log('Indexes created successfully');
  } catch (error) {
    console.error('MongoDB setup error:', error);
    process.exit(1);
  }
};

module.exports = setupMongoDB;
