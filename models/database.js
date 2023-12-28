const mongoose = require('mongoose');
const url = "mongodb://0.0.0.0:27017/galleryDB";



// Function to connect to the database
async function connectDB() {
  try {
    await mongoose.connect(url);
    console.log("Database connected");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

connectDB();
