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
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    //look in the url encoded POST body and delete correct method
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));

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
app.put('/submit', renderUserResults);
app.get('/about', renderAboutUs);
app.get('/calculator', renderCalculator);

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
    .catch(error => handleError(error, response))
    .then(refinedData => refinedData.forEach(element => fillBaseHoursDB(element)
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
}

function renderUserPage(request, response) {
  const thisWillChange = {}
  const text = 'Submit your FMLA hours';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  thisWillChange.language = request.body.language;
  thisWillChange.text = text;
  const dayOfWeek = request.body.dayOfWeek;
  const badgeNumber = request.body.badgeNumber;
  thisWillChange.badgeNumber = badgeNumber;
  const dayOfYear = request.body.currentDay;
  const weekOfDays = [
    parseInt(dayOfYear) - 3,
    parseInt(dayOfYear) - 2,
    parseInt(dayOfYear) - 1,
    parseInt(dayOfYear),
    parseInt(dayOfYear) + 1,
    parseInt(dayOfYear) + 2,
    parseInt(dayOfYear) + 3
  ]
  const target = request.body.language;
  const daysOfWeek = days;
  let url = `https://translation.googleapis.com/language/translate/v2?q=${text}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}`;
  if (thisWillChange.language === 'en') {
    thisWillChange.days = weekMaker(badgeNumber, dayOfYear, dayOfWeek, days)
    let SQL1 = `SELECT date FROM hastis WHERE badge='${badgeNumber}';`;
    client.query(SQL1)
      .then(daysByBadge => {
        daysByBadge.dayArray = daysByBadge.rows.map(dayObject => parseInt(dayObject.date))
        let insertDays = weekOfDays.filter(day => {
          return (daysByBadge.dayArray.includes(day) ? false : true)
        })
        return insertDays
      })
      .catch(error => handleError(error, response))
      .then((insertDays) => {
        let valuesArr = [];
        for (let i = 0; i < insertDays.length; i++) {
          valuesArr.push(`('${badgeNumber}', '${insertDays[i]}', '0')`);
        }
        let SQL2 = `INSERT INTO hastis(badge, date, hours) VALUES ${valuesArr.join()}`
        client.query(SQL2)
        return true
      })
      .catch(error => handleError(error, response))
      .then(() => {
        let SQL3 = `SELECT hours, date FROM hastis WHERE badge ='${badgeNumber}' AND (date=$1 OR date=$2 OR date=$3 OR date=$4 OR date=$5 OR date=$6 OR date=$7) order by date ASC;`;
        let values = weekOfDays;
        client.query(SQL3, values)
          .then(currentHours => {
            thisWillChange.days = thisWillChange.days.map((day, idx) => {
              day.hours = currentHours.rows[idx].hours;
              return day;
            })
          })
          .catch(error => handleError(error, response));
        let SQL4 = `SELECT SUM((CAST(hours AS numeric))), base_hours.sick_leave AS hours_available FROM base_hours RIGHT JOIN hastis on hastis.badge=base_hours.badge WHERE hastis.badge=${badgeNumber} GROUP BY base_hours.sick_leave;`
        client.query(SQL4)
          .then(hours => {
            let parsedHours = hours.rows[0].hours_available - hours.rows[0].sum
            thisWillChange.totalUserHours = Math.floor(parsedHours * 1000)/1000;
            response.render('pages/user', { pageData: thisWillChange })
            return true
          })
      })

      .catch(error => handleError(error, response));
  }
  else {
    superagent.post(url)
      .then(translationResponse => {
        let translationText = translationResponse.body.data.translations[0].translatedText;
        thisWillChange.text = translationText;
        thisWillChange.badgeNumber = badgeNumber;
        return true
      })
      .catch(error => handleError(error, response))
      .then(e => {
        let url2 = `https://translation.googleapis.com/language/translate/v2?q=${daysOfWeek}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}`
        superagent.post(url2)
          .then(daysResponse => {
            let translatedDays = daysResponse.body.data.translations[0].translatedText.split(' ');
            thisWillChange.days = weekMaker(badgeNumber, dayOfYear, dayOfWeek, translatedDays);
            let SQL1 = `SELECT date FROM hastis WHERE badge='${badgeNumber}';`;
            client.query(SQL1)
              .then(daysByBadge => {
                daysByBadge.dayArray = daysByBadge.rows.map(dayObject => parseInt(dayObject.date))
                let insertDays = weekOfDays.filter(day => {
                  return (daysByBadge.dayArray.includes(day) ? false : true)
                })
                return insertDays
              })
              .catch(error => handleError(error, response))
              .catch(error => handleError(error, response))
              .then((insertDays) => {
                let valuesArr = [];
                for (let i = 0; i < insertDays.length; i++) {
                  valuesArr.push(`('${badgeNumber}', '${insertDays[i]}', '0')`);
                }
                let SQL2 = `INSERT INTO hastis(badge, date, hours) VALUES ${valuesArr.join()}`
                client.query(SQL2)
                return true
              })
              .catch(error => handleError(error, response))
              .then(() => {
                let SQL3 = `SELECT SUM((CAST(hours AS numeric))), base_hours.sick_leave AS hours_available FROM base_hours RIGHT JOIN hastis on hastis.badge=base_hours.badge WHERE hastis.badge=${badgeNumber} GROUP BY base_hours.sick_leave;`
                client.query(SQL3)
                  .then(hours => {
                    let parsedHours = hours.rows[0].hours_available - hours.rows[0].sum
                    thisWillChange.totalUserHours = Math.floor(parsedHours * 1000)/1000;
                    return true
                  })
                  .catch(error => handleError(error, response))
                  .then(() => {
                    let SQL3 = `SELECT hours, date FROM hastis WHERE badge ='${badgeNumber}' AND (date=$1 OR date=$2 OR date=$3 OR date=$4 OR date=$5 OR date=$6 OR date=$7) order by date ASC;`;
                    let values = weekOfDays;
                    client.query(SQL3, values)
                      .then(currentHours => {
                        thisWillChange.days = thisWillChange.days.map((day, idx) => {
                          day.hours = currentHours.rows[idx].hours;
                          return day;
                        })
                        response.render('pages/user', { pageData: thisWillChange })
                      })
                      .catch(error => handleError(error, response))
                    return true
                  })
                  .catch(error => handleError(error, response))
                return true
              })
              .catch(error => handleError(error, response))
            return true
          })
          .catch(error => handleError(error, response));
        return true
      })
      .catch(error => handleError(error, response));
  }
}

function renderUserResults(request, response) {
  let responseObj = {};
  const textToTranslate = 'Your total remaining FMLA balance is listed below. Please remember that only 480 hours of FMLA can be used each year.'
  const target = request.body.language;
  const badgeNumber = request.body.badge;
  const inputHours = request.body.hours.map(hour => parseInt(hour));
  const dayOfYear = request.body.daysnumber.map(day => parseInt(day));
  for (let i = 0; i < 7; i++) {
    let SQL = ` UPDATE hastis SET hours ='${inputHours[i]}' WHERE badge ='${badgeNumber}' AND date ='${dayOfYear[i]}';`;
    client.query(SQL)
  }
  let SQL2 = `SELECT hours FROM hastis WHERE badge=${badgeNumber};`;
  client.query(SQL2)
    .then(results => {
      let negativeHours = 0;
      results.rows.forEach(obj => negativeHours += parseInt(obj.hours))
      return negativeHours
    })
    .catch(error => handleError(error, response))

    .then(negativeHours => {
      let SQL3 = `SELECT sick_leave FROM base_hours WHERE badge='${badgeNumber}';`;
      client.query(SQL3)
        .then(hours => {
          responseObj.mathResult = hours.rows[0].sick_leave - negativeHours;
          responseObj.mathResult = Math.floor(responseObj.mathResult * 1000)/1000
        })
        .then((apple) => {
          if (target === 'en') {
            responseObj.translatedText = textToTranslate;
            response.render('pages/userResults', {
              userResults: responseObj
            })
            return true
          }
          else {
            let url = `https://translation.googleapis.com/language/translate/v2?q=${textToTranslate}&key=${process.env.GOOGLE_API_KEY}&source=en&target=${target}`;
            superagent.post(url)
              .then(banana => {
                let translatedText = banana.body.data.translations[0].translatedText;
                responseObj.translatedText = translatedText;
                response.render('pages/userResults', { userResults: responseObj })
                  .catch(error => handleError(error, response))
                return true
              })
          }
        })
        .catch(error => handleError(error, response))
    })
    .catch(error => handleError(error, response))
}

function renderAboutUs(request, response) {
  response.render('pages/about', {})
}

function renderCalculator(request, response) {
  response.render('pages/calculator', {})
}

// tools to make the magic happen


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
    return (!dayOfWeekNumber) ? dayOfWeekNumber + 6 : dayOfWeekNumber - 1
  }
  const increaseDay = (dayOfWeekNumber, increaseby) => {
    dayOfWeekNumber = parseInt(dayOfWeekNumber)
    for (let i = 0; i < increaseby; i++) {
      dayOfWeekNumber = (dayOfWeekNumber === 6) ? 0 : dayOfWeekNumber + 1
    }
    return dayOfWeekNumber
  }
  let startArrayDayOfWeek = decrementDay(decrementDay(decrementDay(startingDayOfWeek)))
  let start = startArrayDay
  let result = [];
  for (let i = 0; i < 7; i++) {
    let weekindex = increaseDay(startArrayDayOfWeek, i)
    result.push({
      dayOfYear: start + i,
      dayOfWeek: weekArray[weekindex],
    })
  }
  return result
}

