chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case "getDom" :
      // psyche, chrome throws an error anytime you try to return a dom object
      break;
    case "getScripts" : 
      sendResponse({scripts: getPageScripts() });
      break;
    case "consoleLog" :
      console.log(request.data);
      break;
    default:
      sendResponse({}); 
  }
});

var getPageScripts = function() {
  var scripts = document.getElementsByTagName('script');
  var strings = [];
  
  for (var x=0; x<scripts.length; ++x) {
    var src = scripts[x].getAttribute('src');
  
    if (src) {
      // do ajax call to get script text 
      // ...
      // strings.push(response.responseText) 
    } else {
      strings.push(scripts[x].innerHTML);
    }
  }
  
  return strings;
}
