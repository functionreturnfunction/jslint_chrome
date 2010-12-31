function loadContentScript() {
  var body = document.getElementsByTagName('body')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '../../src/content.js';
  body.appendChild(script);
  return script;
}

module('Content Script');

test('adds an event listener for onRequest which will respond using the specified callback', function() {
  
});