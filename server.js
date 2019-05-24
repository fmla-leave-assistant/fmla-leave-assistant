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

function getSpreadSheet(request, response) {
  let url= 'https://sheets.googleapis.com/v4/spreadsheets/1xTi2w8NV6QqRjoZDyMrfwbSpBjjakBFJrIpPkCZ5UgI/values/Sheet1?valueRenderOption=FORMATTED_VALUE&key=AIzaSyA0vxlhkfqH7U7BdUtnGb3zWiTMbcJrg0U'

  superagent.get(url) 
  .then(results => {
    let data = results.body.values
    let parsedRows = data.map(row => {
      Row(row)
    })
    parsedRows.shift();
    parsedRows.shift();
    })
    .then(refinedData => console.log(refinedData))
    .catch(error => handleError(error, reponse));
};

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




