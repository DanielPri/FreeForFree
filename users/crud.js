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

//----------Choosing User Type-------------------//
router.post('/admin/addUser', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().chooseUserType(req.body.userType, (err, entities) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect('addUser');
  });
});

//----------------End choose User Type ------------//


router.get('/admin/books', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().listBooks(10, req.query.pageToken, (err, entities, cursor) => {
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
router.get('/admin/books/:book/edit', (req, res, next) => {
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
router.get('/admin/books/:book/delete', (req, res, next) => {
  getModel().deleteBook(req.params.book, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
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
router.get('/admin/magazines/:magazine/edit', (req, res, next) => {
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
router.get('/admin/magazines/:magazine/delete', (req, res, next) => {
  getModel().deleteMagazine(req.params.magazine, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
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
router.get('/admin/music/:music/edit', (req, res, next) => {
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
router.get('/admin/music/:music/delete', (req, res, next) => {
  getModel().deleteMusic(req.params.music, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
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
router.get('/admin/movies/:movie/edit', (req, res, next) => {
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
router.get('/admin/movies/:movie/delete', (req, res, next) => {
  getModel().deleteMovie(req.params.movie, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

 //*************************************************** END MOVIES *******************************************************************/


//*************************************************** SORTING FUNCTIONS *******************************************************************/

//BOOKS
// Create Page: Sort Books By Title
router.get('/admin/sortBooksByTitle', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByTitle(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByTitle.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Books By Format
router.get('/admin/sortBooksByFormat', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByFormat(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByFormat.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Books By Pages
router.get('/admin/sortBooksByPages', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByPages(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByPages.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Books By Language
router.get('/admin/sortBooksByLanguage', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByLanguage(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByLanguage.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Books By Author
router.get('/admin/sortBooksByAuthor', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByAuthor(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByAuthor.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Books By Published
router.get('/admin/sortBooksByPublished', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByPublished(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByPublished.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Books By ISBN-10
router.get('/admin/sortBooksByISBN10', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByISBN10(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByISBN10.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Books By ISBN-13
router.get('/admin/sortBooksByISBN13', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortBooksByISBN13(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortBooksByISBN13.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});
// Create Page: Sort Magazines By Title
router.get('/admin/sortMagazinesByTitle', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortMagazinesByTitle(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortMagazinesByTitle.pug', {
            magazines: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Magazines By Language
router.get('/admin/sortMagazinesByLanguage', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortMagazinesByLanguage(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortMagazinesByLanguage.pug', {
            magazines: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Magazines By Publisher
router.get('/admin/sortMagazinesByPublisher', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortMagazinesByPublisher(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortMagazinesByPublisher.pug', {
            magazines: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Magazines By ISBN-10
router.get('/admin/sortMagazinesByISBN10', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortMagazinesByISBN10(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortMagazinesByISBN10.pug', {
            magazines: entities,
            nextPageToken: cursor
        });
    });
});

// Create Page: Sort Magazines By ISBN-13
router.get('/admin/sortMagazinesByISBN13', oauth2.required, oauth2.adminRequired, (req, res, next) => {
    getModel().sortMagazinesByISBN13(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('users/sortMagazinesByISBN13.pug', {
            magazines: entities,
            nextPageToken: cursor
        });
    });
});

//MOVIES
// Create Page: Sort Movies By Title
router.get('/admin/sortMoviesByTitle', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesByTitle(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Movies By Director
router.get('/admin/sortMoviesByDirector', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesByDirector(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Movies By Producers
router.get('/admin/sortMoviesByProducers', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesByProducers(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Movies By Actors
router.get('/admin/sortMoviesByActors', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesByActors(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Movies By Language
router.get('/admin/sortMoviesByLanguage', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesByLanguage(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Movies By Subtitles
router.get('/admin/sortMoviesBySubtitles', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesBySubtitles(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Movies By Dubbed
router.get('/admin/sortMoviesByDubbed', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesByDubbed(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Movies By Runtime
router.get('/admin/sortMoviesByRuntime', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMoviesByRuntime(10, req.query.pageToken, (err, entities, cursor) => {
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

//MUSIC
// Create Page: Sort Music By Title
router.get('/admin/sortMusicByTitle', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMusicByTitle(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Music By Type
router.get('/admin/sortMusicByType', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMusicByType(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Music By Producers
router.get('/admin/sortMusicByProducers', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMusicByProducers(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Music By Artist
router.get('/admin/sortMusicByArtist', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMusicByArtist(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Music By Label
router.get('/admin/sortMusicByLabel', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMusicByLabel(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Music By Release Date
router.get('/admin/sortMusicByReleaseDate', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMusicByReleaseDate(10, req.query.pageToken, (err, entities, cursor) => {
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

// Create Page: Sort Music By ASIN
router.get('/admin/sortMusicByASIN', oauth2.required, oauth2.adminRequired, (req, res, next) => {
  getModel().sortMusicByASIN(10, req.query.pageToken, (err, entities, cursor) => {
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

//*************************************************** END SORTING FUNCTIONS *******************************************************************/

//*************************************************** ERROR HANDLING *******************************************************************/

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
