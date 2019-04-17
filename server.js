'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

var count = 1;

// App
const app = express();
app.get('/', (req, res) => {
  console.log(`Received request to say hello`);
  res.send(count + '. Hello, Dean\n');
  count++;
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
