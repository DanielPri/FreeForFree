'use strict';

const express = require('express');

const app = express();

// Simple "hello world" from GoogleCloudPlatform tutorials
app.get('/', (req, res) => {
  res.status(200).send('FreeForFree!');
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
