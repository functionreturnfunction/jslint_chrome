var tabid;

var callback = function(response) {
  var scripts = response.scripts;
  
  // if you want to log something, send a message to dom.js which lives on the tab page
  chrome.tabs.sendRequest(tabid, {action: "consoleLog", data: scripts}, callback);
}

chrome.browserAction.onClicked.addListener(function(tab) {
  tabid = tab.id;
  chrome.tabs.sendRequest(tab.id, {action: "getScripts"}, callback);
});
