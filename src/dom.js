var DOM = {
  getScriptsCallback: function(response) {
    var scripts = response.scripts;
    
    // if you want to log something, send a message to content.js which lives on
    // the tab page
    chrome.tabs.sendRequest(tabid, {action: 'consoleLog', data: scripts}, callback);
  },

  getScripts: function(tab) {
    chrome.tabs.sendRequest(tab.id, {action: 'getScripts'}, this.getScriptsCallback);
  },

  initListeners: function() {
    chrome.browserAction.onClicked.addListener(this.getScripts);
  }
};
