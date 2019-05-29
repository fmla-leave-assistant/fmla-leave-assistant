'use strict';

//Access to environmental variables
require('dotenv').config();

//Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const fullLanguageList = require('./fullLanguageList.json');

//App setup
const app = express();
const PORT = process.env.PORT;

//Express middleware
//Utilize expressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
app.post('/login', renderUserPage);
app.post('/submit', submitUserHours);

//Catch all
app.get('*', (request, response) => response.status(404).send('This page does not exist!'));

//Error handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Bruh, something didn\'t work');
}

function getSpreadSheet(request, response) {
  let url = `https://sheets.googleapis.com/v4/spreadsheets/1xTi2w8NV6QqRjoZDyMrfwbSpBjjakBFJrIpPkCZ5UgI/values/Sheet1?valueRenderOption=FORMATTED_VALUE&key=${process.env.GOOGLE_SHEETS_API}`

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

  let SQL = 'INSERT INTO base_hours(boss, name, badge, sick_leave, rdo, first, second) VALUES($1, $2, $3, $4, $5, $6, $7);';
  let values = [data.bossColumn, data.nameColumn, data.badgeColumn, data.sick_leaveColumn, data.rdoColumn, data.firstColumn, data.secondColumn];
  return client.query(SQL, values);

}

// This only needs to be run once but in the event we need to re-initialize the database we are keeping this for now
// getSpreadSheet();

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
  const languagesClean = modifiedLanguageList(fullLanguageList)
  response.render('pages/index', { languagesArray: languagesClean })
  // .catch(error => handleError(error, response));
}

function renderUserPage(request, response) {
  const pageData = {
    text: 'Press here to submit your FMLA hours',
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' , 'Saturday']}
  const dayOfWeek = request.body.dayOfWeek
  const badgeNumber = request.body.badgeNumber
  const dayOfYear = request.body.currentDay
  console.log(dayOfYear);
  const target = request.body.language;
  const thisWillChange = {};
  const text = pageData.text;
  const daysOfWeek = pageData.days;
  getHastis(badgeNumber, daysOfWeek);
  let url = `https://translation.googleapis.com/language/translate/v2?q=${text}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}`;
  if(request.body.language === 'en'){
    response.render('pages/user', {pageData: pageData})
  }
  superagent.post(url)
    .then(translationResponse => {
      let translationText = translationResponse.body.data.translations[0].translatedText;
      thisWillChange.text = translationText;
    })
    .then(e => {
      let url2 = `https://translation.googleapis.com/language/translate/v2?q=${daysOfWeek}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}`
      superagent.post(url2)
        .then(daysResponse => {
          let translatedDays = daysResponse.body.data.translations[0].translatedText.split(' ');
          console.log(dayOfWeek)
          thisWillChange.days = weekMaker(badgeNumber, dayOfYear, dayOfWeek, translatedDays);
          console.log(thisWillChange.days)
          response.render('pages/user', { pageData: thisWillChange })
        })
    })
}

function submitUserHours(request, response) {
  const badgeNumber = request.body.badgeNumber;
  const dayOfYear = request.body.currentDay;
  let inputHours = request.body.IDKWHATTHISVARIABLEISYET;
  updateHastis(badgeNumber, dayOfYear, inputHours);
}

// tools to make the magic happen

function getHastis(badgeNumber, dayOfYear) {
  let sql = `SELECT hours FROM hastis WHERE badge='${badgeNumber}' AND date='${dayOfYear}';`;
  return client.query(sql)
    .then( hastisQuery => {
      if(hastisQuery.rows[0]){
        console.log('PING1');
        return hastisQuery
      } else{
        console.log('PING2');
        let sqlInsert = `INSERT INTO hastis(badge, date, hours) VALUES ($1, $2, $3);`;
        let values = [badgeNumber, dayOfYear, 0];
        client.query(sqlInsert, values)
          .then(result =>{
            return client.query(sql);
          })
      }
    })
}

function updateHastis(badgeNumber, dayOfYear, inputHours){
  let SQL = ` UPDATE hastis SET hours = ${inputHours} WHERE badge = ${badgeNumber} AND date = ${dayOfYear};`;
  return client.query(SQL);
}

function calculateNewUserHours(badgeNum){
  let baseSQL =  `SELECT sick_leave FROM base_hours WHERE badge=${badgeNum};`;
  client.query(baseSQL)
  .then(baseHours => {
    let hastisSQL = `SELECT hours FROM hastis WHERE badge=${badgeNum};`;
    client.query(hastisSQL)
    .then(hastisHours => {
      console.log(baseHours, 'base hours');
      console.log(hastisHours, 'hastis hours');
      console.log(hastisHours.rows[0]); // yields [{hours : 6}]
      console.log(Object.values(hastisHours.rows[0]));
    
      // push all hours entries into an array (or something)
      // .reduce through the array starting with sick_leave as the accumulator
      // return the end result of that math

    })
  }) 
}

calculateNewUserHours(46247);


// I'm moderately proud of this since it does not modify the existing array despite the sort
const modifiedLanguageList = (languageList) => {
  return languageList.map(element => {
    element.name = element.name[0].toUpperCase() + element.name.slice(1, element.name.length)
    return element
  }).sort((a, b) => {
    return ((a.name > b.name) ? 1 : -1);
  }).sort((a, b) => {
    // I'm less proud of this 
    return ((a.name === 'English') ? -1 : 1)
  })
}

const weekMaker = (badgeNumber, startingDayOfYear, startingDayOfWeek, weekArray) => {
  let startArrayDay = parseInt(startingDayOfYear) - 3;
  const decrementDay = (dayOfWeekNumber) => {
    return (!dayOfWeekNumber) ? dayOfWeekNumber + 6 : dayOfWeekNumber -1
  }
  const increaseDay = (dayOfWeekNumber, increaseby) => {
    dayOfWeekNumber = parseInt(dayOfWeekNumber)
    for(let i = 0; i < increaseby; i++){
      dayOfWeekNumber = (dayOfWeekNumber === 6) ? 0 : dayOfWeekNumber + 1
    }
    return dayOfWeekNumber
  }
  let startArrayDayOfWeek = decrementDay(decrementDay(decrementDay(startingDayOfWeek)))

  let start = startArrayDay
  let result = [];
  for(let i = 0; i < 7; i++){
    let weekindex = increaseDay(startArrayDayOfWeek, i)
    console.log(weekindex)
    result.push({
      dayOfYear: start + i,
      dayOfWeek: weekArray[weekindex],
      badgeNumber: badgeNumber
    })
  }
  return result
}


