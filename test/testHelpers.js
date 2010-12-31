function loadScriptDynamically(src) {
  var body = document.getElementsByTagName('body')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  body.appendChild(script);
  return script;
}

var noop = function(){};
