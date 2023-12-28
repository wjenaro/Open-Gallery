// Import required modules
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('../models/database'); 
const Gallery = require('../models/Gallery');
const Workshop=require('../models/Workshop');


exports.signup = async (req, res) => {
  try {
    // Extract user input from the request body
    const { username, password, userType } = req.body;

    // Check if the username or email already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('signup', { errorMessage: 'Username already exists', user: null });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      username,
      password: hashedPassword,
      userType,
    });

    // Save the user to the database
    await newUser.save();

    // Set the user in the session
    req.session.user = newUser;

    // Redirect to a success page or login page
    res.redirect('/login');
  } catch (error) {
    console.error('Error during signup:', error);
    res.render('signup', { errorMessage: 'Error during signup. Please try again.', user: null });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { errorMessage: 'Invalid username or password', user: req.session.user || null });
    }

    req.session.user = user; // Save user in session
    res.redirect('/search');
  } catch (error) {
    console.error('Error during login:', error);
    res.render('login', { errorMessage: 'Error during login. Please try again.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
    }
    res.redirect('/');
  });
};
  // Controller for handling individual artwork details
exports.artworkDetails = (req, res, artworksData) => {
    const title = req.params.title;
    const artwork = artworksData.find((art) => art.Title === title);
  
    if (!artwork) {
      res.status(404).render('error404');
      return;
    }
  
    res.render('artworkDetail', { artwork, user: req.session.user });
  };
  exports.artistProfile = async (req, res) => {
    try {
      // Check if the user is logged in and is an artist
      if (!req.session.user || req.session.user.userType !== 'artist') {
        // Redirect to login page or handle appropriately
        res.redirect('/login');
        return;
      }
  
      // Fetch artworks created by the artist
      const artistArtworks = await Gallery.find({ artist: req.session.user.username });
  
      // Fetch workshops hosted by the artist
      const artistWorkshops = await Workshop.find({ host: req.session.user.username });
  
      // Render the 'artistProfile' view and pass the user, artworks, and workshops data
      res.render('artistProfile', { user: req.session.user, artistArtworks, artistWorkshops });
    } catch (error) {
      console.error('Error during artist profile:', error);
      // Handle the error, redirect, or render an error page as needed
      res.redirect('/login');
    }
  };
  



  // function to galleryController.js
exports.addArtwork = async (req, res) => {
  try {
    // Extract artwork details from the request body
    const { title, year, category, medium, description, poster } = req.body;

    // Create a new artwork instance
    const newArtwork = new Gallery({
      title,
      artist: req.session.user.username,
      year,
      category,
      medium,
      description,
      poster,
    });

    // Save the artwork to the database
    await newArtwork.save();

    // Redirect to the artist profile page after adding the artwork
    res.redirect('/artistProfile');
  } catch (error) {
    console.error('Error adding artwork:', error);
    res.render('addArtwork', { errorMessage: 'Error adding artwork. Please try again.', user: req.session.user });
  }
};

const moment = require('moment');

exports.addWorkshop = async (req, res) => {
  try {
    const { title, date, description, requirements } = req.body;

    // Validate the date format
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.render('addWorkshop', { errorMessage: 'Invalid date format. Please use YYYY-MM-DD.', user: req.session.user });
    }

    const newWorkshop = new Workshop({
      title,
      host: req.session.user.username,
      date,
      description,
      requirements,
    });

    await newWorkshop.save();

    res.redirect('/artistProfile');
  } catch (error) {
    console.error('Error adding workshop:', error);
    res.render('addWorkshop', { errorMessage: 'Error adding workshop. Please try again.', user: req.session.user });
  }
};


exports.addReview = async (req, res) => {
  try {
    const { comment } = req.body;
    const artworkId = req.params.id;

    // Find the artwork by ID
    const artwork = await Gallery.findById(artworkId);

    // Check if the user is logged in
    if (!req.session.user) {
      res.redirect(`/artworks/${artwork.title}`);
      return;
    }

    // Check if the user has already submitted a review for this artwork
    if (artwork.reviews.some(review => review.user === req.session.user.username)) {
      // User has already reviewed, handle appropriately (redirect, show message, etc.)
      res.redirect(`/artworks/${artwork.title}`);
      return;
    }


    artwork.reviews.push({ user: req.session.user.username, comment });
    await artwork.save();

    // Redirect back to the artwork details page
    res.redirect(`/artworks/${artwork.title}`);
  } catch (error) {
    console.error('Error adding review:', error);
    res.render('error500'); // Handle the error appropriately
  }
};


exports.addLike = async (req, res) => {
  try {
    const artworkId = req.params.id;

    // Find the artwork by ID
    const artwork = await Gallery.findById(artworkId);

    // Check if the user is logged in
    if (!req.session.user) {
      res.redirect(`/artworks/${artwork.title}`);
      return;
    }

    // Check if the user already liked the artwork
    if (artwork.likes.some(like => like.user === req.session.user.username)) {
      // User already liked, handle appropriately (redirect, show message, etc.)
      res.redirect(`/artworks/${artwork.title}`);
      return;
    }


    artwork.likes.push({ user: req.session.user.username });
    await artwork.save();

    // Redirect back to the artwork details page
    res.redirect(`/artworks/${artwork.title}`);
  } catch (error) {
    console.error('Error adding like:', error);
    res.render('error500'); // Handle the error appropriately
  }
};


exports.artistProfile = async (req, res) => {
  try {
    // Check if the user is logged in and is an artist
    if (!req.session.user || req.session.user.userType !== 'artist') {
      // Redirect to login page or handle appropriately
      res.redirect('/login');
      return;
    }

    // Fetch artworks created by the artist
    const artistArtworks = await Gallery.find({ artist: req.session.user.username });

    // Fetch workshops hosted by the artist
    const artistWorkshops = await Workshop.find({ host: req.session.user.username });

    // Render the 'artistProfile' view and pass the user, artworks, and workshops data
    res.render('artistProfile', { user: req.session.user, artistArtworks, artistWorkshops });
  } catch (error) {
    console.error('Error during artist profile:', error);
    // Handle the error, redirect, or render an error page as needed
    res.redirect('/login');
  }
};



// Add a function to render the edit review page
exports.editReviewPage = async (req, res) => {
  try {
    const artworkId = req.params.id;
    const reviewId = req.params.reviewId;

    // Fetch the artwork by ID
    const artwork = await Gallery.findById(artworkId);

    // Find the review by ID
    const review = artwork.reviews.find(r => r._id.toString() === reviewId);

    // Render the 'editReview' view and pass the artwork and review data
    res.render('editReview', { artwork, review, user: req.session.user });
  } catch (error) {
    console.error('Error rendering edit review page:', error);
    res.render('error500'); // Handle the error appropriately
  }
};

// Add a function to handle the edit review form submission
exports.editReview = async (req, res) => {
  try {
    const { comment } = req.body;
    const artworkId = req.params.id;
    const reviewId = req.params.reviewId;

    // Find the artwork by ID
    const artwork = await Gallery.findById(artworkId);

    // Find the index of the review by ID
    const reviewIndex = artwork.reviews.findIndex(r => r._id.toString() === reviewId);

    // Update the review comment
    artwork.reviews[reviewIndex].comment = comment;
    await artwork.save();

    // Redirect back to the artwork details page
    res.redirect(`/artworks/${artwork.title}`);
  } catch (error) {
    console.error('Error editing review:', error);
    res.render('error500'); // Handle the error appropriately
  }
};

// Add a function to handle the delete review form submission
exports.deleteReview = async (req, res) => {
  try {
    const artworkId = req.params.id;
    const reviewId = req.params.reviewId;

    // Find the artwork by ID
    const artwork = await Gallery.findById(artworkId);

    // Remove the review by ID
    artwork.reviews = artwork.reviews.filter(r => r._id.toString() !== reviewId);
    await artwork.save();

    // Redirect back to the artwork details page
    res.redirect(`/artworks/${artwork.title}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    res.render('error500'); // Handle the error appropriately
  }
};



exports.followUser = async (req, res) => {
  try {
    const artistUsername = req.params.username;

    // Find the artist to follow
    const artist = await User.findOne({ username: artistUsername });

    if (!artist) {
      // Handle the case where the artist does not exist
      res.render('error404');
      return;
    }

    // Check if the user is logged in
    if (!req.session.user) {
      // Redirect to login if not logged in
      res.redirect('/login');
      return;
    }

    // Check if the user is already following the artist
    if (req.session.user.following.includes(artist._id)) {
      // User is already following, handle unfollow
      req.session.user.following = req.session.user.following.filter(followedUser => followedUser.toString() !== artist._id.toString());
    } else {
      // User is not following, handle follow
      req.session.user.following.push(artist._id);
    }

    // Save the user's updated following list
    await req.session.user.save();

    // Redirect back to the artist profile page
    res.redirect('/artistProfile');
  } catch (error) {
    console.error('Error during follow/unfollow:', error);
    res.render('error500');
  }
};


const Follow = require('../models/Follow');

exports.followUser = async (req, res) => {
  try {
    const artistUsername = req.params.username;

    // Find the artist to follow
    const artist = await User.findOne({ username: artistUsername });

    if (!artist) {
      res.render('error404');
      return;
    }

    if (!req.session.user) {
      res.redirect('/login');
      return;
    }

    // Check if the user is already following the artist
    const isFollowing = req.session.user.followingArtists.includes(artist._id);

    if (isFollowing) {
      // If already following, unfollow
      req.session.user.followingArtists = req.session.user.followingArtists.filter(followedUser => followedUser.toString() !== artist._id.toString());
    } else {
      // If not following, follow
      req.session.user.followingArtists.push(artist._id);
    }

    await req.session.user.save();

    res.redirect('/artistProfile');
  } catch (error) {
    console.error('Error during follow/unfollow:', error);
    res.render('error500');
  }
};




exports.deleteArtwork = async (req, res) => {
  try {
    const artworkTitle = req.params.title;

    const artwork = await Gallery.findOne({ title: artworkTitle });

    if (!artwork) {
   
      return res.sendStatus(404);
    }

 
    await artwork.deleteOne();

    
    res.sendStatus(204); 
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.sendStatus(500); 
  }
};



exports.updateArtwork = async (req, res) => {
  try {
    // Fetch the artwork based on the title from your database
    const artwork = await Gallery.findOne({ title: req.params.title });

    if (!artwork) {
      // Handle the case where artwork is not found
      return res.status(404).send('Artwork not found');
    }

    // Render the updateArtwork view with the artwork data
    res.render('updateArtwork', { artwork, user: req.session.user });
  } catch (error) {
    // Handle errors (e.g., database errors)
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




// Handle form submission for updating an artwork
exports.handleUpdateArtwork = async (req, res) => {
  const artworkId = req.params.id;

  try {
    // Find the artwork by ID from the database
    const artwork = await Gallery.findById(artworkId);

    if (!artwork) {
      // Handle the case where artwork is not found
      return res.status(404).send('Artwork not found');
    }

    // Update the artwork data with the form data
    artwork.title = req.body.title;
    artwork.year = req.body.year;
    artwork.category = req.body.category;
    artwork.medium = req.body.medium;
    artwork.description = req.body.description;
    artwork.poster = req.body.poster;

    // Save the updated artwork to the database
    await artwork.save();

    // Redirect to the artwork details page or any other appropriate route
    res.redirect(`/artistProfile`);
  } catch (error) {
    // Handle errors (e.g., validation errors, database errors)
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


exports.deleteWorkshop = async (req, res) => {
  try {
    // Fetch the artwork based on the title from your database
    const workshop = await Workshop.findOne({ title: req.params.title });

    if (!workshop) {
      // Handle the case where artwork is not found
      return res.status(404).send('Workshop not found');
    }

    // Render the updateArtwork view with the artwork data
    res.render('updateArtwork', { workshop, user: req.session.user  });
  } catch (error) {
    // Handle errors (e.g., database errors)
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


 exports.showUpdateWorkshopForm = async (req, res) => {
  try {
   
    const workshop = await Workshop.findOne({ title: req.params.title });

    if (!workshop) {
     
      return res.status(404).send('WorkShopnot found');
    }

   
    res.render('updateWorkshop', { workshop, user: req.session.user });
  } catch (error) {

    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
 

// Controller method to update a workshop
exports.updateWorkshop = async (req, res) => {

 const workshopId=req.params.id;

  try {
 
    const workshop = await Workshop.findById(workshopId);

    if (!workshop) {
            return res.status(404).send('WorkShop not found');
    }

    workshop.title = req.body.title;
    workshop.date = req.body.date;
    workshop.description = req.body.description;
    workshop.requirements = req.body.requirements;

    await workshop.save();

    res.redirect(`/artistProfile`);
  } catch (error) {

    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};





// Controller method to display workshops
exports.displayWorkshops = async (req, res) => {
  try {
    // Fetch workshops from the database
    const workshops = await Workshop.find();

    // Render the workshops EJS file with the fetched data
    res.render('workshops', { workshops, user: req.session.user });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.render('error500'); // Handle the error appropriately
  }
};

 
