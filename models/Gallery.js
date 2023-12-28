
// models/gallery.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: String, // username of the user who wrote the review
  comment: String,
  // Add other review-related fields as needed
});

const likeSchema = new mongoose.Schema({
  user: String, // username of the user who liked the artwork
});

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    
  },
  artist: {
    type: String,
   
  },
  year: Number,
  category: String,
  medium: String,
  description: String,
  poster: String,
  reviews: [reviewSchema], // Array of reviews
  likes: [likeSchema], // Array of likes
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
