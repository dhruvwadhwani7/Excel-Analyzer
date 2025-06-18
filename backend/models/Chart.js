const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  chartType: { 
    type: String, 
    required: true,
    validate: {
      validator: function(type) {
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
  data: {
    type: Array,
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(point => 
          point && typeof point === 'object' &&
          point.hasOwnProperty('x') && 
          point.hasOwnProperty('y') &&
          (!this.dimension || this.dimension !== '3d' || point.hasOwnProperty('z'))
        );
      },
      message: 'Chart data must be an array of points with x, y (and z for 3D) coordinates'
    }
  },
  dataPreview: [Object],
  createdAt: { 
    type: Date, 
    default: () => new Date(Date.now() + (5.5 * 60 * 60 * 1000)), // Add IST offset
    expires: 43200 // 12 hours in seconds
  },
  image: {
    type: String,
    required: true
  },
  chartConfig: {
    type: Object,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
});

// Add indexes
chartSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 43200,
  background: true 
});
chartSchema.index({ fileId: 1 });

// Pre-save middleware
chartSchema.pre('save', async function(next) {
  try {
    const File = require('./File');
    const file = await File.findById(this.fileId);
    if (!file) {
      throw new Error('Referenced file does not exist');
    }
    
    const fileExpiry = new Date(file.uploadDate.getTime() + 43200000);
    if (this.createdAt > fileExpiry) {
      throw new Error('Chart cannot outlive its file');
    }

    // Limit data points and preview
    if (this.data && this.data.length > 1000) {
      this.data = this.data.slice(0, 1000);
    }
    if (this.dataPreview && this.dataPreview.length > 10) {
      this.dataPreview = this.dataPreview.slice(0, 10);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Methods
chartSchema.methods.getISTTime = function() {
  return new Date(this.createdAt.getTime() + (5.5 * 60 * 60 * 1000));
};

module.exports = mongoose.model('Chart', chartSchema);
