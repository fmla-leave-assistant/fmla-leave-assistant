function convertTime(input) {
  let hrs = parseInt(Number(input));
  let mins = Math.floor((Number(input)-hrs + 0.0001) * 60);
  if (mins < 10) {
    mins = '0' + mins;
  }
  let total = hrs+':'+mins;
return total;
};

function convertSl (form) {
  let sl = $('#sickLeave').val();
  let slConverted = convertTime(sl);
  $('#slOutput').html(`Operator has ${slConverted} hours of SL`);
}

function convertVl (form2) {
  let vl = $('#vacationLeave').val();
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

function inputGrossHours() {
 let grossHours = $('#hours').val();
 let gh = parseInt(Number(grossHours));
 grossHoursArr.push(gh);
}

function getChoices() {
  let values = $('.choice option:selected').text();
  // let splitValues = values.split(/(?=[A-Z])/);
  selectedChoices.push(values);
}

function splitDatShit(() => {
 let splitValues = values.split(/(?=[A-Z])/);
 itIsSplit.push(splitValues);
})

$('#master').click(() => {
 console.log(shit);
 console.log(itIsSplit);
  inputGrossHours();
  console.log(grossHoursArr);
  getChoices();
  console.log(selectedChoices);
  convertSl();
  convertVl();
  convertPpl();
  convertAc();
})
