const mongoose = require('mongoose');
const fs = require('fs');

const fileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['csv', 'xlsx', 'xls'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileData: {
    type: Array,
    required: true
  },
  preview: {
    type: Array,
    default: []
  },
  columns: {
    type: [String],
    default: []
  },
  rowCount: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: () => new Date(Date.now() + (5.5 * 60 * 60 * 1000)), // Add IST offset
    expires: 43200 // 12 hours in seconds
  },
  status: {
    type: String,
    enum: ['processing', 'processed', 'failed'],
    default: 'processing'
  },
  filePath: {
    type: String,
    required: true
  }
});

// Update TTL index with correct expiry time
fileSchema.index({ uploadDate: 1 }, { 
  expireAfterSeconds: 43200,
  background: true 
});

// Index for faster queries
fileSchema.index({ userId: 1, uploadDate: -1 });

// Add cleanup middleware to delete file when document is deleted
fileSchema.pre('deleteOne', { document: true }, function(next) {
  if (this.filePath && fs.existsSync(this.filePath)) {
    fs.unlinkSync(this.filePath);
  }
  next();
});

// Add post-remove hook to delete associated charts
fileSchema.post('deleteOne', { document: true }, async function(doc) {
  try {
    const Chart = require('./Chart');
    await Chart.deleteMany({ fileId: doc._id });
  } catch (error) {
    console.error('Error deleting associated charts:', error);
  }
});

// Add post-TTL hook using change streams for automatic cleanup
fileSchema.statics.setupTTLCleanup = async function() {
  try {
    const Chart = require('./Chart');
    const collection = this.collection;
    const changeStream = collection.watch([{ $match: { operationType: 'delete' } }]);
    
    changeStream.on('change', async (change) => {
      try {
        await Chart.deleteMany({ fileId: change.documentKey._id });
      } catch (error) {
        console.error('Error in TTL cleanup:', error);
      }
    });
  } catch (error) {
    console.error('Error setting up TTL cleanup:', error);
  }
};

// Add a method to get IST time
fileSchema.methods.getISTTime = function() {
  return new Date(this.uploadDate.getTime() + (5.5 * 60 * 60 * 1000));
};

fileSchema.pre('save', function(next) {
  if (this.fileData && Array.isArray(this.fileData)) {
    // Ensure preview data exists
    if (!this.preview || this.preview.length === 0) {
      this.preview = this.fileData.slice(0, 10);
    }
    // Ensure columns are extracted
    if (!this.columns || this.columns.length === 0 && this.fileData[0]) {
      this.columns = Object.keys(this.fileData[0]);
    }
    // Update row count
    this.rowCount = this.fileData.length;
  }
  next();
});

module.exports = mongoose.model('File', fileSchema);
