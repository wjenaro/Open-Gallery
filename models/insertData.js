// import necessary libraries
const mongoose = require('mongoose');
const Gallery = require('./Gallery'); // Assuming your Gallery model is in the 'models' folder
const galleryData = require('../artworks/gallery.json');
const connectionString = "mongodb://0.0.0.0:27017/galleryDB";

// Connect to MongoDB
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Handle MongoDB connection error
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Iterate over each artwork in the JSON file and save it to the Gallery collection
    for (const artwork of galleryData) {
      const galleryInstance = new Gallery({
        title: artwork.Title,
        artist: artwork.Artist,
        year: parseInt(artwork.Year),
        category: artwork.Category,
        medium: artwork.Medium,
        description: artwork.Description,
        poster: artwork.Poster,
      });

      // Save the artwork to the collection
      await galleryInstance.save();
    }

    console.log(`${galleryData.length} documents inserted into the Gallery collection`);
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
});
