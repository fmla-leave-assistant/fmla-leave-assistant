'use strict';
console.log('app.js loaded, this message is located in the app.js file')

$('#createuser').toggle()
function flipLogin() {
  $('#createuser, #loginform').toggle()
}

// Date.prototype.getDayOfYear() = {Math.floor((((new Date()) - (new Date(new Date().getFullYear(), 0, 0))) / 525600/ 60000 )* 365)}
// const getDayOfYear = () => Math.floor((((new Date()) - (new Date(new Date().getFullYear(), 0, 0))) / 525600/ 60000 )* 365)

Date.prototype.getDayNumber = () => Math.floor((((new Date()) - (new Date(new Date().getFullYear(), 0, 0))) / 525600 / 60000) * 365)


$('#replacewithdayofyear')[0].defaultValue = new Date().getDayNumber()
