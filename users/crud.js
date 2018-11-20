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
  res.render('users/admin/catalog.pug')
});

//--------Add User----------//
router.get('/admin/addUser', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().findUnregisteredUser(3, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/addUser.pug', {
      users: entities
     });
  });
});


//----------Choosing User Type-------------------//
router.post('/admin/addUser', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  console.log(req.body.userType)
  getModel().chooseUserType(req.body.userType, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect('addUser');
  });
});

//----------------End choose User Type ------------//

//=================== Get All User Info =========================/
router.get('/admin/editUserInfo', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().findUserInfo((err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/editUserInfo.pug', {
      users: entities
     });
  });
});
//=================== End Get All User Info =====================/

//=================== Get All User Info =========================/
router.post('/admin/editUserInfo', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().editUserInfo(req.body, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect('editUserInfo');
  });
});
//=================== End Get All User Info =====================/



router.get('/admin/books', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().listBooks(10, req.query.pageToke, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/books.pug', {
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
    res.render('users/admin/magazines.pug', {
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
    res.render('users/admin/movies.pug', {
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
    res.render('users/admin/music.pug', {
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
  res.render('users/admin/formBook.pug', {
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
router.post('/admin/formBook', oauth2.required, oauth2.adminRequired, images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
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
router.post('/admin/formMagazine', oauth2.required, oauth2.adminRequired, images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
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
  res.render('users/admin/formMagazine.pug', {
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
router.post('/admin/formMovie', oauth2.required, oauth2.adminRequired, images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
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
  res.render('users/admin/formMovie.pug', {
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
router.post('/admin/formMusic', oauth2.required, oauth2.adminRequired, images.multer.single('image'), images.sendUploadToGCS, (req, res, next) => {
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
  res.render('users/admin/formMusic.pug', {
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
     res.render('users/admin/list.pug', {
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
   var editing = false;
   getModel().verifyEditing(req.params.book, (err, result) => {
     if (err) {
       next(err);
       return;
     }
     if (result.length == 1 && req.user.id != result[0].id) {
       editing = true;
     }
   });
   getModel().readBook(req.params.book, (err, entity) => {
     if (err) {
       next(err);
       return;
     }
     res.render('users/admin/viewBook.pug', {
       book: entity,
       check: editing
     });
   });
 });

 /**
 * GET /books/:id/edit
 *
 * Display a book for editing.
 */
router.get('/admin/books/:book/edit',  oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().verifyEditing(req.params.book, (err, result) => {
    if (err) {
      next(err);
      return;
    }
    if (result.length == 1 && req.user.id != result[0].id) {
      res.redirect(`/users/admin/books`);
    }
  });
  getModel().readBook(req.params.book, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/formBook.pug', {
      book: entity,
      action: 'Edit'
    });
  });
  getModel().startEditing(req.user.id, req.params.book, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
  });
});

/**
 * POST /books/:id/edit
 *
 * Update a book.
 */
router.post(
  '/admin/books/:book/edit', oauth2.required, oauth2.adminRequired,
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
    getModel().stopEditing(req.user.id, req.params.book, (err) => {
      if (err) {
        next(err);
        return;
      }
    });
  }
);


/**
 * GET /books/:id/delete
 *
 * Delete a book.
 */
router.get('/admin/books/:book/delete',   oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().delete(req.params.book, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect('..');
  });
});
 //************************************************* END BOOK *******************************************************************/


//*************************************************** MAGAZINE ****************************************************************/

 /**
  * GET /Magazine/:id
  *
  * Display a Magazine.
  */
 router.get('/admin/magazines/:magazine', oauth2.required, oauth2.adminRequired, (req, res, next) => {
   var editing = false;
   getModel().verifyEditing(req.params.magazine, (err, result) => {
     if (err) {
       next(err);
       return;
     }
     if (result.length == 1 && req.user.id != result[0].id) {
       editing = true;
     }
   });
  getModel().readMagazine(req.params.magazine, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/viewMagazine.pug', {
      magazine: entity,
      check: editing
    });
  });
});

 /**
 * GET /magazine/:id/edit
 *
 * Display a magazine for editing.
 */
router.get('/admin/magazines/:magazine/edit', oauth2.required, oauth2.adminRequired,(req, res, next) => {
  getModel().verifyEditing(req.params.magazine, (err, result) => {
    if (err) {
      next(err);
      return;
    }
    if (result.length == 1 && req.user.id != result[0].id) {
      res.redirect(`/users/admin/magazines`);
    }
  });
  getModel().readMagazine(req.params.magazine, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/formMagazine.pug', {
      magazine: entity,
      action: 'Edit'
    });
  });
  getModel().startEditing(req.user.id, req.params.magazine, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
  });
});


/**
 * POST /magazine/:id/edit
 *
 * Update a magazine.
 */
router.post(
  '/admin/magazines/:magazine/edit', oauth2.required, oauth2.adminRequired,
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
    getModel().stopEditing(req.user.id, req.params.magazine, (err) => {
      if (err) {
        next(err);
        return;
      }
    });
  }
);


/**
 * GET /magazine/:id/delete
 *
 * Delete a magazine
 */
router.get('/admin/magazines/:magazine/delete', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().delete(req.params.magazine, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect('..');
  });
});
//*************************************************** END MAGAZINE ****************************************************************/


//*************************************************** MUSIC *******************************************************************/

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
    res.render('users/admin/viewMusic.pug', {
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
  getModel().verifyEditing(req.params.music, (err, result) => {
    if (err) {
      next(err);
      return;
    }
    if (result.length == 1 && req.user.id != result[0].id) {
      res.redirect(`/users/admin/music`);
    }
  });
  getModel().readMusic(req.params.music, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/formMusic.pug', {
      music: entity,
      action: 'Edit'
    });
  });
  getModel().startEditing(req.user.id, req.params.music, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
  });
});


/**
 * POST /music/:id/edit
 *
 * Update a music.
 */
router.post(
  '/admin/music/:music/edit', oauth2.required, oauth2.adminRequired,
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

    getModel().stopEditing(req.user.id, req.params.music, (err) => {
      if (err) {
        next(err);
        return;
      }
    });
  }
);


/**
 * GET /music/:id/delete
 *
 * Delete a music
 */
router.get('/admin/music/:music/delete',  oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().delete(req.params.music, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect('..');
  });
});
//*************************************************** END MUSIC *******************************************************************/


//*************************************************** MOVIES *******************************************************************/

 /**
  * GET /Movie/:id
  *
  * Display a Movie.
  */
 router.get('/admin/movies/:movie', oauth2.required, oauth2.adminRequired, (req, res, next) => {
   var editing = false;
   getModel().verifyEditing(req.params.movie, (err, result) => {
     if (err) {
       next(err);
       return;
     }
     if (result.length == 1 && req.user.id != result[0].id) {
       editing = true;
     }
   });
  getModel().readMovie(req.params.movie, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/viewMovie.pug', {
      movie: entity,
      check: editing
    });
  });
});

 /**
 * GET /movie/:id/edit
 *
 * Display a movie for editing.
 */
 router.get('/admin/movies/:movie/edit', oauth2.required, oauth2.adminRequired, (req, res, next) => {
   getModel().verifyEditing(req.params.movie, (err, result) => {
     if (err) {
       next(err);
       return;
     }
     if (result.length == 1 && req.user.id != result[0].id) {
       res.redirect(`/users/admin/movies`);
     }
   });
   getModel().readMovie(req.params.movie, (err, entity) => {
     if (err) {
       next(err);
       return;
     }
     res.render('users/admin/formMovie.pug', {
       movie: entity,
       action: 'Edit'
     });
   });
   getModel().startEditing(req.user.id, req.params.movie, (err, savedData) => {
     if (err) {
       next(err);
       return;
     }
   });
 });


/**
 * POST /movie/:id/edit
 *
 * Update a movie.
 */
router.post(
'/admin/movies/:movie/edit', oauth2.required, oauth2.adminRequired,
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
  getModel().stopEditing(req.user.id, req.params.movie, (err) => {
    if (err) {
      next(err);
      return;
    }
  });
}
);

/**
 * GET /movie/:id/delete
 *
 * Delete a movie
 */
 router.get('/admin/movies/:movie/delete', oauth2.required, oauth2.adminRequired, (req, res, next) => {
   getModel().delete(req.params.movie, (err) => {
     if (err) {
       next(err);
       return;
     }
     res.redirect('..');
   });
 });
 //*************************************************** END MOVIES *******************************************************************/

//********************************************************SEARCH AND SORT*****************************************************//

//For catalog.  Will eventually search the entire  database for any matches in search bar
router.post('/admin/catalog', (req, res, next) => {
  const anyPossibility = req.body.searchBar;
  console.log(anyPossibility);
  getModel().findByAttribute(anyPossibility, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/catalog.pug', {
      items: entities,
      type: 'movies'
    });
  });
});

//Search for specific book attributes
router.post('/admin/books', (req, res, next) => {
  const bookSearchBy = req.body;
  if (bookSearchBy.searchBar.length == 0) {
    bookSearchBy.searchBar = 1;
    bookSearchBy.books = 1;
  }
  getModel().findByAttribute("books", bookSearchBy.books, bookSearchBy.searchBar, bookSearchBy.sortBy, bookSearchBy.sortUpDown, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/books.pug', {
      books: entities,
    });
  });
});

//Search for specific magazine attributes
router.post('/admin/magazines', (req, res, next) => {
  const magazinesSearchBy = req.body;
  if (magazinesSearchBy.searchBar.length == 0) {
    magazinesSearchBy.searchBar = 1;
    magazinesSearchBy.magazines = 1;
  }
  getModel().findByAttribute("magazines", magazinesSearchBy.magazines, magazinesSearchBy.searchBar, magazinesSearchBy.sortBy, magazinesSearchBy.sortUpDown,
  (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/admin/magazines.pug', {
      magazines: entities,
    });
  });
});

//Search for specific movie attributes
router.post('/admin/movies', (req, res, next) => {

    const moviesSearchBy = req.body;
    if (moviesSearchBy.searchBar.length == 0) {
        moviesSearchBy.searchBar = 1;
        moviesSearchBy.movies = 1;
    }
    getModel().findByAttribute("movies", moviesSearchBy.movies, moviesSearchBy.searchBar, moviesSearchBy.sortBy, moviesSearchBy.sortUpDown,  (err, entities) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/admin/movies.pug', {
            movies: entities,
        });
    });
});

//Search for specific music attributes
router.post('/admin/music', (req, res, next) => {

    const musicSearchBy = req.body;
    if (musicSearchBy.searchBar.length == 0) {
        musicSearchBy.searchBar = 1;
        musicSearchBy.music = 1;
    }
    getModel().findByAttribute("musics", musicSearchBy.music, musicSearchBy.searchBar, musicSearchBy.sortBy, musicSearchBy.sortUpDown, (err, entities) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/admin/music.pug', {
            musics: entities,
        });
    });
});
//*************************************************** END SEARCH AND SORT FUNCTIONS *************************************************************/

//************************************************* START CLIENT ROUTERS AND FUNCTIONS **********************************************************/

//--------Catalog----------//
router.get('/client/catalog', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  res.render('users/client/catalog.pug')
});

router.get('/client/books', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  getModel().listBooks(10, req.query.pageToke, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/books.pug', {
      books: entities,
      nextPageToken: cursor
    });
  });
});

router.get('/client/magazines', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  getModel().listMagazines(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/magazines.pug', {
      magazines: entities,
      nextPageToken: cursor
    });
  });
});

router.get('/client/cart', oauth2.required, oauth2.clientRequired, (req, res, next) => {
    res.render('users/client/cartPage.pug')
});

router.get('/client/movies', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  getModel().listMovies(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/movies.pug', {
      movies: entities,
      nextPageToken: cursor
    });
  });
});

router.get('/client/music', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  getModel().listMusics(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/music.pug', {
      musics: entities,
      nextPageToken: cursor
    });
  });
});

//************************************************* BOOK *******************************************************************/

  //* Display a book.
 router.get('/client/books/:book', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  getModel().readBook(req.params.book, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/viewBook.pug', {
      book: entity
    });
  });
});

//*************************************************** MAGAZINE ****************************************************************/

  //* Display a Magazine.
 router.get('/client/magazines/:magazine', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  getModel().readMagazine(req.params.magazine, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/viewMagazine.pug', {
      magazine: entity
    });
  });
});

//*************************************************** MUSIC *******************************************************************/

  //* Display a Music.
 router.get('/client/music/:music', oauth2.required, oauth2.clientRequired, (req, res, next) => {
   var editing = false;
   getModel().verifyEditing(req.params.music, (err, result) => {
     if (err) {
       next(err);
       return;
     }
     if (result.length == 1 && req.user.id != result[0].id) {
       editing = true;
     }
   });
  getModel().readMusic(req.params.music, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/viewMusic.pug', {
      music: entity,
      check: editing
    });
  });
});

//*************************************************** MOVIES *******************************************************************/

//* Display a Movie.
router.get('/client/movies/:movie', oauth2.required, oauth2.clientRequired, (req, res, next) => {
  getModel().readMovie(req.params.movie, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/viewMovie.pug', {
      movie: entity
    });
  });
});

//********************************************************SEARCH AND SORT*****************************************************//

//For catalog.  Will eventually search the entire  database for any matches in search bar
router.post('/client/catalog', (req, res, next) => {
  const anyPossibility = req.body.searchBar;
  console.log(anyPossibility);
  getModel().findByAttribute(anyPossibility, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/catalog.pug', {
      items: entities,
      type: 'movies'
    });
  });
});

//Search for specific book attributes
router.post('/client/books', (req, res, next) => {
  const bookSearchBy = req.body;
  if (bookSearchBy.searchBar.length == 0) {
    bookSearchBy.searchBar = 1;
    bookSearchBy.books = 1;
  }
  getModel().findByAttribute("books", bookSearchBy.books, bookSearchBy.searchBar, bookSearchBy.sortBy, bookSearchBy.sortUpDown, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/books.pug', {
      books: entities,
    });
  });
});

//Search for specific magazine attributes
router.post('/client/magazines', (req, res, next) => {
  const magazinesSearchBy = req.body;
  if (magazinesSearchBy.searchBar.length == 0) {
    magazinesSearchBy.searchBar = 1;
    magazinesSearchBy.magazines = 1;
  }
  getModel().findByAttribute("magazines", magazinesSearchBy.magazines, magazinesSearchBy.searchBar, magazinesSearchBy.sortBy, magazinesSearchBy.sortUpDown,
  (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/magazines.pug', {
      magazines: entities,
    });
  });
});

//Search for specific movie attributes
router.post('/client/movies', (req, res, next) => {
  const moviesSearchBy = req.body;
  if (moviesSearchBy.searchBar.length == 0) {
    moviesSearchBy.searchBar = 1;
    moviesSearchBy.movies = 1;
  }
  getModel().findByAttribute("movies", moviesSearchBy.movies, moviesSearchBy.searchBar, moviesSearchBy.sortBy, moviesSearchBy.sortUpDown,  (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/movies.pug', {
      movies: entities,
    });
  });
});

//Search for specific music attributes
router.post('/client/music', (req, res, next) => {
  const musicSearchBy = req.body;
  if (musicSearchBy.searchBar.length == 0) {
    musicSearchBy.searchBar = 1;
    musicSearchBy.music = 1;
  }
  getModel().findByAttribute("musics", musicSearchBy.music, musicSearchBy.searchBar, musicSearchBy.sortBy, musicSearchBy.sortUpDown, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/client/music.pug', {
      musics: entities,
    });
  });
});
//*************************************************** END SEARCH AND SORT FUNCTIONS *************************************************************/

//*************************************************** END CLIENT ROUTERS AND FUNCTIONS **********************************************************/

//********************************************************** ERROR HANDLING *********************************************************************/

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
