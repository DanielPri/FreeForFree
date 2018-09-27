'use strict';

const path = require('path');
const express = require('express');

const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Books
app.use('/books', require('./books/crud'));

// Home Route
app.get('/', (req, res) => {
  res.redirect('/users');
});

// Basic 404 handler -> found from google cloud tutorials
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Basic error handler -> found from google cloud tutorials
app.use((err, req, res, next) => {
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  // [START server]
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
