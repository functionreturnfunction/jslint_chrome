var listenerCallback = function(request, sender, sendResponse) {
  switch (request.action) {
  case 'getDom':
    // psyche, chrome throws an error anytime you try to return a dom object
    break;
  case 'getScripts': 
    sendResponse({scripts: getPageScripts()});
    break;
  case 'consoleLog':
    console.log(request.data);
    break;
  default:
    sendResponse({}); 
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

var initListener = function() {
  chrome.extension.onRequest.addListener(listenerCallback);
};
