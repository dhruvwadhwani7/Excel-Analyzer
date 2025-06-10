const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { isAdmin } = require('../config/adminConfig');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role
    }
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Prevent admin registration through API
    if (req.body.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot register as admin'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { phoneNumber: phoneNumber }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 
          'Email already registered' : 
          'Phone number already registered'
      });
    }

    // Create new user with +91 prefix for phone number
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password,
      role: 'regular' // default role
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Check for admin credentials first
    const adminMatch = isAdmin(identifier, password);
    if (adminMatch) {
      const token = jwt.sign(
        { id: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: 'admin',
          name: 'Administrator',
          email: identifier,
          role: 'admin'
        }
      });
    }

    // Check if identifier is email or phone number
    const isEmail = identifier.includes('@');
    const query = isEmail 
      ? { email: identifier }
      : { phoneNumber: identifier.replace(/\D/g, '').slice(-10) };

    const user = await User.findOne(query).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};
