const mongoose = require('mongoose');

// Define a user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // Assuming usernames should be unique
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['patron', 'artist'], // Added userType field
    default: 'patron' // Default userType is patron
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedArtworks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork'
  }],
  reviews: [{
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork'
    },
    text: String
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Follow',
  }],
  followingArtists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Track the artworks liked and reviewed
  likedArtworks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
  }],
  reviewedArtworks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
  }],
});

// Create a user model
const User = mongoose.model('User', userSchema);

module.exports = User;
