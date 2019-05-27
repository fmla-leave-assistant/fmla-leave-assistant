'use strict';
console.log ('app.js loaded, this message is located in the app.js file')

$('#createuser').toggle()
function flipLogin () {
    $('#createuser, #loginform').toggle()
}


const getDayOfYear = () => Math.floor((((new Date()) - (new Date(now.getFullYear(), 0, 0))) / 525600/ 60000 )* 365)