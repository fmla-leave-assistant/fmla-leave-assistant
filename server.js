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

//Express middleware
//Utilize expressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


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
app.post('/')


//Catch all
app.get('*', (request, response) => response.status(404).send('This page does not exist!'));


//Error handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Bruh, something didn\'t work');
}

function getSpreadSheet(request, response) {
  let url= `https://sheets.googleapis.com/v4/spreadsheets/1xTi2w8NV6QqRjoZDyMrfwbSpBjjakBFJrIpPkCZ5UgI/values/Sheet1?valueRenderOption=FORMATTED_VALUE&key=${process.env.GOOGLE_SHEETS_API}`

  superagent.get(url)
    .then(results => {
      let parsedRows = results.body.values.map(row => {
        return new Row(row)
      })
      parsedRows.shift();
      parsedRows.shift();
      return parsedRows
    })
    .then(refinedData => refinedData.forEach(element => fillBaseHoursDB(element)
      .catch(error => handleError(error, response))
    ))
    .catch(error => handleError(error, response));
}

function fillBaseHoursDB(data) {

  let SQL= 'INSERT INTO base_hours(boss, name, badge, sick_leave, rdo, first, second) VALUES($1, $2, $3, $4, $5, $6, $7);';
  let values = [data.bossColumn, data.nameColumn, data.badgeColumn, data.sick_leaveColumn, data.rdoColumn, data.firstColumn, data.secondColumn];
  return client.query(SQL,values);

}

getSpreadSheet();

function Row(info) {
  this.bossColumn = info[0];
  this.nameColumn = info[1];
  this.badgeColumn = info[2];
  this.sick_leaveColumn = info[6];
  this.rdoColumn = info[4];
  this.firstColumn = info[7];
  this.secondColumn = info[9];
}

//Helper functions
function homePage(request, response) {
  response.render('pages/index', { languagesArray: fullLanguageList })
    .catch(error => handleError(error, response));
}

function renderUserPage(request, response) {
  const target = request.body.loginform[2];
  const thisWillChange = {};
  const text = 'Press here to submit your FMLA hours';
  const daysOfWeek = ['Monday .. Tuesday .. Wednesday .. Thursday .. Friday .. Saturday .. Sunday'];
  let url = `https://translation.googleapis.com/language/translate/v2?q=${text}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}`;
  superagent.post(url)
    .then(translationResponse => {
      let translationText = (translationResponse.body.data.translations[0].translatedText);
      thisWillChange.text = translationText;
    })
    .then(e => {
      let url2 = `https://translation.googleapis.com/language/translate/v2?q=${daysOfWeek}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}`
      superagent.post(url2)
        .then(daysResponse => {
          let translatedDays = daysResponse.body.data.translations[0].translatedText.split(' ');
          thisWillChange.days = translatedDays;
          response.render('pages/user', { pageData: thisWillChange })
        })
    })
}
