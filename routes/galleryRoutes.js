const express= require('express');
const router =express.Router();
const galleryController = require('../controllers/galleryController');

router.get('/', (req, res) => {

    res.render('index' , {user: req.session.user });
  });

 
router.get('/signup', (req, res) => {

  res.render('signup', { errorMessage: '', user: req.session.user || null });
});
router.post('/signup', galleryController.signup);


// Route for the login page
router.get('/login', (req, res) => {
    // Render the 'login' view
    res.render('login', { errorMessage: '', user: req.session.user  });
  });
  
  // Handle login form submission
  router.post('/login', galleryController.login);
  router.get('/logout', galleryController.logout);

 
// Route for the artworks page
const Gallery=require('../models/Gallery');

router.get('/artworks', async (req, res) => {
  try {
    // Fetch artworks from your data source (e.g., Gallery model)
    const artworksData = await Gallery.find();
  

    // Render the 'artworks' view and pass the artworks data
    res.render('artworks', { artworks: artworksData, user: req.session.user });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.render('error500'); // Handle the error appropriately
  }
});

router.get('artworkDetail/:id', async (req, res)=>{
  const artID=req.params.id;

  try {
    // Fetch artwork by title from the database
    const artwork = await Gallery.findOne({ "_id": artID });

    if (!artwork) {
      res.status(404).render('error404');
      return;
    }

  
    res.render('artworkDetail', { artwork, user: req.session.user });
  } catch (error) {
    console.error('Error fetching artwork details:', error);
    res.render('error500');
  }

});
 
router.get('/artworks/:title', async (req, res) => {
  const idtitle = req.params.title;

  try {
    // Fetch artwork by title from the database
    const artwork = await Gallery.findOne({ "title": idtitle });

    if (!artwork) {
      res.status(404).render('error404');
      return;
    }

  
    res.render('artworkDetail', { artwork, user: req.session.user });
  } catch (error) {
    console.error('Error fetching artwork details:', error);
    res.render('error500');
  }
});

router.get('/artistProfile', galleryController.artistProfile);


 // Route for the user profile page
router.get('/userProfile', (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    
    res.redirect('/login');
    return;
  }

  
  if (req.session.user.userType === 'artist') {
    // Redirect artists to the artist profile page
    res.redirect('/artistProfile');
    return;
  }


  res.render('userProfile', { user: req.session.user });
});
 


router.get('/artistProfile', galleryController.artistProfile);

// route to galleryRoutes.js
router.get('/addArtwork', (req, res) => {
  // Render the 'addArtwork' view
  res.render('addArtwork', { user: req.session.user });
});

router.post('/addArtwork', galleryController.addArtwork);


router.get('/addWorkshop', (req, res) => {
  // Render the 'addWorkshop' view
  res.render('addWorkshop', { user: req.session.user });
});

router.post('/addWorkshop', galleryController.addWorkshop);

router.post('/artworks/:id/add-review', galleryController.addReview);

// Route to add like
router.post('/artworks/:id/like', galleryController.addLike);



// a route to handle the edit review page
router.get('/artworks/:id/edit-review/:reviewId', galleryController.editReviewPage);

//  a route to handle the edit review form submission
router.post('/artworks/:id/edit-review/:reviewId', galleryController.editReview);

//  a route to handle the delete review form submission
router.post('/artworks/:id/delete-review/:reviewId', galleryController.deleteReview);

// Route to follow/unfollow an artist
router.get('/follow/:username', galleryController.followUser);

router.get('/workshops', galleryController.displayWorkshops);

router.get('/search', async (req, res) => {
  try {
    const { q, page } = req.query;
    const perPage = 10;
    const currentPage = page || 1;

    // Build the query to search for artworks
    const query = {
      $or: [
        { title: { $regex: new RegExp(q, 'i') } },
        { artist: { $regex: new RegExp(q, 'i') } },
        { category: { $regex: new RegExp(q, 'i') } },
        // Add additional search criteria as needed
      ],
    };

    // Fetch artworks based on the search query and pagination
    const artworks = await Gallery.find(query)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // Count total matching artworks for pagination
    const totalArtworks = await Gallery.countDocuments(query);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalArtworks / perPage);

    // Render the 'search' view and pass the search results and pagination data
    res.render('search', {
      artworks,
      user: req.session.user,
      totalPages,
      currentPage: +currentPage,
      searchQuery: q,
    });
  } catch (error) {
    console.error('Error during search:', error);
    res.render('error500'); // Handle the error appropriately
  }
});



// Route to delete an artwork
router.delete('/deleteArtwork/:title', galleryController.deleteArtwork);

// Route to update an artwork 
router.get('/updateArtwork/:title', galleryController.updateArtwork);


// Route to handle the form submission for updating an artwork
router.post('/updateArtwork/:id', galleryController.handleUpdateArtwork);
///============================================================


// Route to delete a workshop
router.delete('/deleteWorkshop/:title', galleryController.deleteWorkshop);

//shows
router.get('/updateWorkshop/:title', galleryController.showUpdateWorkshopForm);

// Route to handle the submission of the workshop update form
router.post('/updateWorkshop/:id', galleryController.updateWorkshop);
//======================================



module.exports=router;