'use strict';

//Access to environmental variables
require('dotenv').config();

//Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');


//App setup
const app = express();
const PORT = process.env.PORT;


//Connecting to the database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));


//Turn the server on
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

//Set the view engine for server-side templating
app.set('view engine', 'ejs');


//API routes
app.get('/', homePage);


//Catch all
app.get('*', (request, response) => response.status(404).send('This page does not exist!'));


//Error handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Bruh, something didn\'t work');
}


//Helper functions
function homePage(request, response) {
  let languages = [];
  let targetLanguage = 'en';
  let url = `https://translation.googleapis.com/language/translate/v2/languages?target=${targetLanguage}&key=${process.env.GOOGLE_API_KEY}`;
  console.log(url);
  superagent.get(url)
    .then(results => languages = results.body.data.languages)
    .then(() => response.render('pages/index', { languagesArray:languages }))
    .catch(error => handleError(error, response));
}
