'use strict';

function convertTime(input) {
  var hrs = parseInt(Number(input));
  var mins = Math.floor((Number(input)-hrs + 0.0001) * 60);
  if (mins < 10) {
    mins = '0' + mins;
  }
  var total = hrs+':'+mins;
return total;
};

function convertSl (form) {
  var sl = $('#sickLeave').val();
  let slConverted = convertTime(sl);
  $('#slOutput').html(`Operator has ${slConverted} hours of SL`);
}

function convertVl (form2) {
  var vl = $('#vacationLeave').val();
  let vlConverted = convertTime(vl);
  $('#vlOutput').text(`Operator has ${vlConverted} hours of VL`);
}

function convertAc (form3) {
  let ac = $('#ac').val();
  let acConverted = convertTime(ac);
  $('#acOutput').text(`Operator has ${acConverted} hours of AC`);
}

function convertPpl (form4) {
  let ppl = $('#ppl').val();
  let pplConverted = convertTime(ppl);
  $('#pplOutput').text(`Operator has ${pplConverted} hours of PPL`);
  console.log(pplConverted);
}

$('#master').click(() => {
  convertSl();
  convertVl();
  convertPpl();
  convertAc();
})