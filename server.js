'use strict';

//Access to environmental variables
require('dotenv').config();

//Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
<<<<<<< HEAD
=======
const { Translate } = require('@google-cloud/translate');
>>>>>>> 2584e1fae98ad10607fd5e90f8ef2659fa760380
const fullLanguageList = require('./fullLanguageList.json');

//App setup
const app = express();
const PORT = process.env.PORT;


app.use(express.static('public/'));


//Connecting to the database
const translate = new Translate();
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));


//Turn the server on
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));


//Set the view engine for server-side templating
app.set('view engine', 'ejs');


//API routes
app.get('/', homePage);
app.get('/login', renderUserPage);


//Catch all
app.get('*', (request, response) => response.status(404).send('This page does not exist!'));


//Error handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Bruh, something didn\'t work');
}

function getSpreadSheet(request, response) {
  console.log('PING');
  let url= `https://sheets.googleapis.com/v4/spreadsheets/1xTi2w8NV6QqRjoZDyMrfwbSpBjjakBFJrIpPkCZ5UgI/values/Sheet1?valueRenderOption=FORMATTED_VALUE&key=${process.env.GOOGLE_SHEETS_API}`

  superagent.get(url)
    .then(results => {
      let data = results.body.values;
      let parsedRows = data.map(row => {
        return new Row(row)
      })
      parsedRows.shift();
      parsedRows.shift();
      return parsedRows
    })
    .then(refinedData => console.log(refinedData))
    .catch(error => handleError(error, response));
}

getSpreadSheet();

function Row(info) {
  this.bossColumn = info[0];
  this.nameColumn = info[1];
  this.badgeColumn = info[2];
  this.sick_leaveColumn = info[6];
  this.rdo = info[4];
  this.first = info[7];
  this.second = info[9];
}




//Helper functions
function homePage(request, response) {
  response.render('pages/index', {languagesArray: fullLanguageList})
    .then(results => languages = results.body.data.languages)
    .then(() => response.render('pages/index', {languagesArray: fullLanguageList}))
    .catch(error => handleError(error, response));
}

function renderUserPage(request, response) {
  let thisWillChange = {};
  response.render('/pages/user', {pageData: thisWillChange})
}


function translateText(text, target) {
  let [translations] = translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log('Translations:');
  translations.forEach((translation, i) => {
    console.log(`${text[i]} => (${target}) ${translation}`);
  });
}

