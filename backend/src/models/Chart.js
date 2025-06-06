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
    default: Date.now
  }
});

// Update TTL index for 12-hour expiry (12 * 60 * 60 seconds)
chartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 });

// Add index for faster querying by fileId
chartSchema.index({ fileId: 1 });

module.exports = mongoose.model('Chart', chartSchema);
