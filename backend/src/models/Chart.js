const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  chartType: { 
    type: String, 
    required: true,
    validate: {
      validator: function(type) {
        // Auto-set dimension based on chart type
        const is3D = ['column3d', 'bar3d', 'line3d', 'scatter3d', 'area3d'].includes(type);
        this.dimension = is3D ? '3d' : '2d';
        return true;
      }
    }
  },
  dimension: { type: String, enum: ['2d', '3d'], default: '2d' },
  title: String,
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  zAxis: String,
  dataPreview: [Object],
  createdAt: { 
    type: Date, 
    default: () => new Date(Date.now() + (5.5 * 60 * 60 * 1000)), // Add IST offset
    expires: 43200 // 12 hours in seconds
  }
});

// Update TTL index with correct expiry time
chartSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 43200,
  background: true 
});

// Add index for faster querying by fileId
chartSchema.index({ fileId: 1 });

// Add validation to ensure file exists
chartSchema.pre('save', async function(next) {
  try {
    const File = require('./File');
    const file = await File.findById(this.fileId);
    if (!file) {
      throw new Error('Referenced file does not exist');
    }
    // Align chart expiry with file expiry
    const fileExpiry = new Date(file.uploadDate.getTime() + 43200000); // 12 hours
    if (this.createdAt > fileExpiry) {
      throw new Error('Chart cannot outlive its file');
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add a method to get IST time
chartSchema.methods.getISTTime = function() {
  return new Date(this.createdAt.getTime() + (5.5 * 60 * 60 * 1000));
};

module.exports = mongoose.model('Chart', chartSchema);
