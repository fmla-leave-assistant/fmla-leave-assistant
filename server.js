'use strict';

//Access to environmental variables
require('dotenv').config();

//Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const { Translate } = require('@google-cloud/translate');
const fullLanguageList = require('./fullLanguageList.json');



//App setup
const app = express();
const PORT = process.env.PORT;


app.use(express.static('public/'));
app.use(express.urlencoded({ extended: true }));


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
app.post('/login', renderUserPage);


//Catch all
app.get('*', (request, response) => response.status(404).send('This page does not exist!'));


//Error handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Bruh, something didn\'t work');
}

function getSpreadSheet(request, response) {
  console.log('PING');
  let url = `https://sheets.googleapis.com/v4/spreadsheets/1xTi2w8NV6QqRjoZDyMrfwbSpBjjakBFJrIpPkCZ5UgI/values/Sheet1?valueRenderOption=FORMATTED_VALUE&key=${process.env.GOOGLE_SHEETS_API}`

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
function fillBaseHoursDB(data) {
  let SQL = 'INSERT INTO base_hours (boss, name, badge, sick_leave, rdo, first, second VALUES($1, $2, $3, $4, $5, $6, $7);';
  let values = [data.bossColumn,]
}

// getSpreadSheet();

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
  response.render('pages/index', { languagesArray: fullLanguageList })
}

function renderUserPage(request, response) {
  console.log(request.body);
  //example response body  { loginform: [ '12345678', 'p@ssw0rd!', 'ku' ] }
  let thisWillChange = {
    days: ['monday', 'tuesday', 'weds', 'thursday', 'friday', 'saturday', 'sunday'],
    text: ['This is text in the 0 index',
      'This page currently depends on an object named \'pageData\' with the following key/values',
      'days: [array of days of the week which is translated], text: [array of all text fields with translated text]'
    ]
  }
  response.render('pages/user', { pageData: thisWillChange })
}


function translateText(text, target) {
  let [translations] = translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log('Translations:');
  translations.forEach((translation, i) => {
    console.log(`${text[i]} => (${target}) ${translation}`);
  });
}
