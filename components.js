const components = [
  {
    name: 'DefaultButton',
    path: './lib/'
  },
  {
    name: 'DatePicker',
    path: './lib/'
  },
];

function compare(a, b) {
  var textA = a.name.toUpperCase();
  var textB = b.name.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
}

function sortComponents() {
  return components.sort(compare);
}

module.exports = sortComponents();
