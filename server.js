'use strict';

//Access to environmental variables
require('dotenv').config();

//Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');


//App setup
const app = express();
const PORT = process.env.PORT;


//Connecting to the database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));


//Turn the server on
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));


//API routes



//Error handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Bruh, something didn\'t work');
}


