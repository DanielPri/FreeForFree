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

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
router.use(oauth2.template);

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
// [START add_magazine]
router.get('/admin/formMagazine', oauth2.required, oauth2.adminRequired, (req, res) => {
  res.render('users/formMagazine.pug', {
    magazine: {},
    action: 'Add'
  });
});
// [END add_magazine]

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

// [START add_book]
router.get('/admin/formMusic', oauth2.required, oauth2.adminRequired, (req, res) => {
  res.render('users/formMusic.pug', {
    music: {},
    action: 'Add'
  });
});
// [END add_book]

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
