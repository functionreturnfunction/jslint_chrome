var listenerCallback = function(request, sender, callback) {
  switch (request.action) {
  case 'getDom':
    // psyche, chrome throws an error anytime you try to return a dom object
    break;
  case 'getScripts': 
    callback({scripts: getPageScripts()});
    break;
  case 'consoleLog':
    console.log(request.data);
    break;
  default:
    callback({}); 
  }
};

var getPageScripts = function() {
  var scripts = document.getElementsByTagName('script'),
    strings = [], src;
  
  for (var i = scripts.length - 1; i >= 0; --i) {
    src = scripts[i].getAttribute('src');
    if (src) {
      strings.push(src);
    }
  }
  
  return strings;
};

var initListeners = function() {
  chrome.extension.onRequest.addListener(listenerCallback);
};
