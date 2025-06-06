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
    default: Date.now,
    expires: 43200 // 12 hours in seconds (12 * 60 * 60)
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

// Ensure TTL index is created
fileSchema.index({ uploadDate: 1 }, { expireAfterSeconds: 43200 });

// Index for faster queries
fileSchema.index({ userId: 1, uploadDate: -1 });

// Add cleanup middleware to delete file when document is deleted
fileSchema.pre('deleteOne', { document: true }, function(next) {
  if (this.filePath && fs.existsSync(this.filePath)) {
    fs.unlinkSync(this.filePath);
  }
  next();
});

module.exports = mongoose.model('File', fileSchema);
