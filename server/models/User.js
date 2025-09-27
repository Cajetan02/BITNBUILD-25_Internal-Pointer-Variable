const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  profile: {
    dateOfBirth: Date,
    panNumber: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    employment: {
      type: String, // 'salaried', 'self_employed', 'business'
      company: String,
      designation: String
    }
  },
  preferences: {
    currency: {
      type: String,
      default: 'INR'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      defaultPeriod: {
        type: String,
        default: 'month'
      },
      showTips: {
        type: Boolean,
        default: true
      }
    }
  },
  financialProfile: {
    annualIncome: Number,
    taxRegime: {
      type: String,
      enum: ['old', 'new'],
      default: 'new'
    },
    cibilScore: Number,
    lastCibilUpdate: Date,
    riskProfile: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
