const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v); // Validates Indian mobile numbers without +91
      },
      message: props => `${props.value} is not a valid Indian phone number!`
    }
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['admin', 'regular'],
    default: 'regular'
  },
  createdAt: { 
    type: Date, 
    default: () => new Date(Date.now() + (5.5 * 60 * 60 * 1000)) // Add IST offset
  }
});

// Add a method to get IST time
userSchema.methods.getISTTime = function() {
  return new Date(this.createdAt.getTime() + (5.5 * 60 * 60 * 1000));
};

// Add index for login lookup optimization
userSchema.index({ email: 1, phoneNumber: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
