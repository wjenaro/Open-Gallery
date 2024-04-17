const mongoose = require('mongoose');
require('dotenv').config();
const dbURI = process.env.MONGODB_URI ;

async function connectDB() {
  try {
    if (!dbURI) {
      throw new Error("MONGODB_URI environment variable is not defined.");
    }

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Database connected");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

connectDB();
