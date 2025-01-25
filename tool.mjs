export {
  isleapyear,
  endofmonth,
  elId,elVal,removeHtml,
  changeText,changeHtml
}
let isleapyear = (y) => !(y % 400) || !(y%4) && !!(y%100);

let endofmonth =  (y,m) => 30 + (m+1*(m>=8))%2 - (2 - isleapyear(y))*(m==2);

function elId(id) {
  return document.querySelector('#' + id);
}
function elVal(id) {
  return elId(id).value;
}
function removeHtml(el) {
  console.log(`removeHtml el=${el}`);
  while (el.hasChildNodes()) {
    el.removeChild(el.firstChild);
  }
}
function changeText(el, t) {
  console.log(`changeText: el=${el}, t=${t}`);
  removeHtml(el);
  let tn = document.createTextNode(t);
  el.appendChild(tn);
}
function changeHtml(el, t) {
  removeHtml(el);
  el.innerHTML = t
}
