'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const MemcachedStore = require('connect-memjs')(session);
const passport = require('passport');
const config = require('./config');

const app = express();

// Load View Engine
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);

// [START session] -> found from google cloud tutorials
// Configure the session and session storage.
const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: config.get('SECRET'),
  signed: true
};

// In production use the Memcache instance to store session data,
// otherwise fallback to the default MemoryStore in development.
if (config.get('NODE_ENV') === 'production' && config.get('MEMCACHE_URL')) {
  if (config.get('MEMCACHE_USERNAME') && (config.get('MEMCACHE_PASSWORD'))) {
    sessionConfig.store = new MemcachedStore({
      servers: [config.get('MEMCACHE_URL')],
      username: config.get('MEMCACHE_USERNAME'),
      password: config.get('MEMCACHE_PASSWORD')});
  } else {
    sessionConfig.store = new MemcachedStore({
      servers: [config.get('MEMCACHE_URL')]
    });
  }
}

app.use(session(sessionConfig));
// [END session]

// OAuth2
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./lib/oauth2').router);

// Books
app.use('/users', require('./users/crud'));

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
  const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
