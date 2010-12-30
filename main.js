var theFunction;

function createInjectableListener() {
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    alert('request received...');
    var obj = window;
    var parts = request.obj.split('.');
    for (var i = 0; i < parts.length; ++i) {
      obj = obj[parts[i]];
    }
    alert('sending back object ' + obj.toString());
    sendResponse({obj: obj});
  });
}

function dealWithSelectedTab(tab) {
  alert('sending request...');
  chrome.tabs.sendRequest(tab.id, {obj: 'document.getElementsByTagName'}, function(response) {
    alert('sending response...');
    theFunction = response.obj;
    alert(theFunction);
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {
  alert('adding listener for tab with id ' + tab.id.toString());
  var code = '(' + createInjectableListener.toString() + ')();';
  alert(code);
  chrome.tabs.executeScript(tab.id, {code: code}, function() {
    dealWithSelectedTab(tab);
  });
});
