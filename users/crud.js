// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const images = require('../lib/images');
const oauth2 = require('../lib/oauth2');
const bodyParser = require('body-parser');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();
//////////////////////////////////////////////
// var app     = express();
// app.use(bodyParser.urlencoded({ extended: true })); 
////////////

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
router.use(oauth2.template);
router.use(bodyParser.urlencoded({ extended: true }));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

router.get('/', (req, res, next) => {
  res.render('users/login.pug')
});

//--------Catalog----------//
router.get('/admin/catalog', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  res.render('users/catalog.pug')
});

//--------Add User----------//
router.get('/admin/addUser', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().findUnregisteredUser(3, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/addUser.pug', {
      users: entities
     });
  });
});

//-------Search Catalogue------//
router.get('/admin/adminSearch', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    res.render('users/adminSearch.pug')
});

//--------EDit user----------//
// router.get('/admin/editUser', oauth2.required, oauth2.adminRequired, (req, res, next) => {
//   getModel().findUserByType(0,(err, entities) => {
//     if (err) {
//       next(err);
//       return;
//     }
//     res.render('users/addUser.pug', {
//       users: entities
//      });
//   });
//   res.render('users/editUser.pug')
// });

//--------Submit button to change user type status----------//
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;


router.post('/admin/addUser', oauth2.required, oauth2.adminRequired, (req, res, next) => { 
  // var allSelectedElements= getUserType();
  console.log("---------------------------------begining----------------------------------------------");
  console.log(req.body.userType);
  console.log("-----------------------------------end-------------------------------------------------");
  getModel().chooseUserType(req.body.userType, (err, entities) => {
    if (err) {

      next(err);
      return;
    }
    res.redirect('addUser');
  });
});
  

router.get('/admin/books', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().listBooks(10, req.query.pageToke, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/books.pug', {
      books: entities,
      nextPageToken: cursor
    });
  });
});

router.get('/admin/magazines', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().listMagazines(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/magazines.pug', {
      magazines: entities,
      nextPageToken: cursor
    });
  });
});

router.get('/admin/movies', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().listMovies(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/movies.pug', {
      movies: entities,
      nextPageToken: cursor
    });
  });
});

router.get('/admin/music', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().listMusics(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/music.pug', {
      musics: entities,
      nextPageToken: cursor
    });
  });
});
//--------//

/**

 * Display a page for creating a book.
 */
// [START add_book]
router.get('/admin/formBook', oauth2.required, oauth2.adminRequired, (req, res) => {
  res.render('users/formBook.pug', {
    book: {},
    action: 'Add'
  });
});
// [END add_book]

/**
 * POST /books/add
 *
 * Create a book.
 */
// [START add_post]
router.post('/admin/formBook', images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
  const data = req.body;
  // Was an image uploaded? If so, we'll use its public URL
  // in cloud storage.
  if (req.file && req.file.cloudStoragePublicUrl) {
    data.imageUrl = req.file.cloudStoragePublicUrl;
  }

  // Save the data to the database.
  getModel().createBook(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`/users/admin/books`);
  });
});
// [END add_post]

/**

 * Display a page for creating a magazines.
 */
/**
 * POST /magazine/add
 *
 * Create a magazine.
 */
// [START add_post]
router.post('/admin/formMagazine', images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
  const data = req.body;
  // Was an image uploaded? If so, we'll use its public URL
  // in cloud storage.
  if (req.file && req.file.cloudStoragePublicUrl) {
    data.imageUrl = req.file.cloudStoragePublicUrl;
  }

  // Save the data to the database.
  getModel().createMagazine(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`/users/admin/magazines`);
  });
});
// [END add_post]

/**

 * Display a page for creating a magazines.
 */
// [START add_magazine]
router.get('/admin/formMagazine', oauth2.required, oauth2.adminRequired, (req, res) => {
  res.render('users/formMagazine.pug', {
    magazine: {},
    action: 'Add'
  });
});
// [END add_magazine]

/**
 * POST /movie/add
 *
 * Create a movie.
 */
// [START add_post]
router.post('/admin/formMovie', images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
  const data = req.body;
  // Was an image uploaded? If so, we'll use its public URL
  // in cloud storage.
  if (req.file && req.file.cloudStoragePublicUrl) {
    data.imageUrl = req.file.cloudStoragePublicUrl;
  }

  // Save the data to the database.
  getModel().createMovie(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`/users/admin/movies`);
  });
});
// [END add_post]

/**

 * Display a page for creating a movie.
 */
// [START add_movie]
router.get('/admin/formMovie', oauth2.required, oauth2.adminRequired, (req, res) => {
  res.render('users/formMovie.pug', {
    movie: {},
    action: 'Add'
  });
});
// [END add_movie]

/**
 * POST /music/add
 *
 * Create a music.
 */

// [START add_post]
router.post('/admin/formMusic', images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
  const data = req.body;
  // Was an image uploaded? If so, we'll use its public URL
  // in cloud storage.
  if (req.file && req.file.cloudStoragePublicUrl) {
    data.imageUrl = req.file.cloudStoragePublicUrl;
  }

  // Save the data to the database.
  getModel().createMusic(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`/users/admin/music`);
  });
});
// [END add_post]

/**

 * Display a page for creating a music.
 */
// [START add_music]
router.get('/admin/formMusic', oauth2.required, oauth2.adminRequired, (req, res) => {
  res.render('users/formMusic.pug', {
    music: {},
    action: 'Add'
  });
});
// [END add_music]

/**
 * GET /users
 *
 * Display a page of users (up to ten at a time).
 */
 router.get('/admin/list', oauth2.required, oauth2.adminRequired, (req, res, next) => {
   getModel().list(1, 10, req.query.pageToken, (err, entities, cursor) => {
     if (err) {
       next(err);
       return;
     }
     res.render('users/list.pug', {
       users: entities,
       nextPageToken: cursor
     });
   });
 });


 //************************************************* BOOK *******************************************************************/

 /**
  * GET /books/:id
  *
  * Display a book.
  */
 router.get('/admin/books/:book', oauth2.required, oauth2.adminRequired, (req, res, next) => {
   getModel().readBook(req.params.book, (err, entity) => {
     if (err) {
       next(err);
       return;
     }
     res.render('users/viewBook.pug', {
       book: entity
     });
   });
 });

 /**
 * GET /books/:id/edit
 *
 * Display a book for editing.
 */
router.get('/admin/books/:book/edit',  oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().readBook(req.params.book, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/formBook.pug', {
      book: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /books/:id/edit
 *
 * Update a book.
 */
router.post(
  '/admin/books/:book/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  (req, res, next) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    getModel().updateBook(req.params.book, data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(`/users/admin/books`);
    });
  }
);


/**
 * GET /books/:id/delete
 *
 * Delete a book.
 */
router.get('/admin/books/:book/delete',   oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().deleteBook(req.params.book, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

 //****************************************************************************************************************************/


//*************************************************** Magazine ****************************************************************/

 /**
  * GET /Magazine/:id
  *
  * Display a Magazine.
  */
 router.get('/admin/magazines/:magazine', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().readMagazine(req.params.magazine, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/viewMagazine.pug', {
      magazine: entity
    });
  });
});

 /**
 * GET /magazine/:id/edit
 *
 * Display a magazine for editing.
 */
router.get('/admin/magazines/:magazine/edit', oauth2.required, oauth2.adminRequired,(req, res, next) => {
  getModel().readMagazine(req.params.magazine, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/formMagazine.pug', {
      magazine: entity,
      action: 'Edit'
    });
  });
});


/**
 * POST /magazine/:id/edit
 *
 * Update a magazine.
 */
router.post(
  '/admin/magazines/:magazine/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  (req, res, next) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    getModel().updateMagazine(req.params.magazine, data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(`/users/admin/magazines`);
    });
  }
);


/**
 * GET /magazine/:id/delete
 *
 * Delete a magazine
 */
router.get('/admin/magazines/:magazine/delete', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().deleteMagazine(req.params.magazine, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

 //****************************************************************************************************************************/


//*************************************************** Music *******************************************************************/

 /**
  * GET /Music/:id
  *
  * Display a Music.
  */
 router.get('/admin/music/:music', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().readMusic(req.params.music, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/viewMusic.pug', {
      music: entity
    });
  });
});

 /**
 * GET /music/:id/edit
 *
 * Display a music for editing.
 */
router.get('/admin/music/:music/edit', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().readMusic(req.params.music, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/formMusic.pug', {
      music: entity,
      action: 'Edit'
    });
  });
});


/**
 * POST /music/:id/edit
 *
 * Update a music.
 */
router.post(
  '/admin/music/:music/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  (req, res, next) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    getModel().updateMusic(req.params.music, data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(`/users/admin/music`);
    });
  }
);


/**
 * GET /music/:id/delete
 *
 * Delete a music
 */
router.get('/admin/music/:music/delete',  oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().deleteMusic(req.params.music, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

 //****************************************************************************************************************************/


//*************************************************** MOVIES *******************************************************************/

 /**
  * GET /Movie/:id
  *
  * Display a Movie.
  */
 router.get('/admin/movies/:movie', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().readMovie(req.params.movie, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/viewMovie.pug', {
      movie: entity
    });
  });
});

 /**
 * GET /movie/:id/edit
 *
 * Display a movie for editing.
 */
router.get('/admin/movies/:movie/edit', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().readMovie(req.params.movie, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/formMovie.pug', {
      movie: entity,
      action: 'Edit'
    });
  });
});


/**
 * POST /movie/:id/edit
 *
 * Update a movie.
 */
router.post(
  '/admin/movies/:movie/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  (req, res, next) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    getModel().updateMovie(req.params.movie, data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect(`/users/admin/movies`);
    });
  }
);


/**
 * GET /movie/:id/delete
 *
 * Delete a movie
 */
router.get('/admin/movies/:movie/delete', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().deleteMovie(req.params.movie, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

 //****************************************************************************************************************************/

//********************************************************Search And Sort*****************************************************//





router.post('/admin/catalog', (req, res, next) => {

    const anyPossibility = req.body.searchBar;
    console.log(anyPossibility);
    getModel().findByAttribute(anyPossibility, (err, entities) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/catalog.pug', {
            items: entities,
            type: 'movies'
        });
    });
});




router.post('/admin/books', (req, res, next) => {

    const bookSearchBy = req.body;
    console.log("HELLLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    console.log(bookSearchBy.books);
    console.log(bookSearchBy.searchBar);
    getModel().findByAttribute("books", bookSearchBy.books, bookSearchBy.searchBar,(err, entities) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/books.pug', {
            books: entities,
        });
    });
});



router.get('/admin/search', (req, res, next) => {

    res.render('users/adminSearch.pug', {
        items: entities,
        type: 'movies'
    });
});






/**
 * Errors on "/users/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = err.message;
    next(err);
});

module.exports = router;
