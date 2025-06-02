const mongoose = require('mongoose');

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
    type: Buffer,
    required: true
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
  }
});

// Ensure TTL index is created
fileSchema.index({ uploadDate: 1 }, { expireAfterSeconds: 43200 });

// Index for faster queries
fileSchema.index({ userId: 1, uploadDate: -1 });

module.exports = mongoose.model('File', fileSchema);
