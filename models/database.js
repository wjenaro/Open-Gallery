
const mongoose = require('mongoose');
const path =require('path');
//require('dotenv').config(path: path.resolve(__dirname, '../.env'));
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://apexsolz:O18XQB4KDF10bTRa@cluster0.ou4v6.mongodb.net/';

//require('dotenv').config(); // Load the .env file

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Print the variable to the console


async function connectDB() {
  try {
    if (!dbURI) {
      throw new Error("MONGODB_URI environment variable is not defined.");
    }

    await mongoose.connect(dbURI);

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

connectDB();

