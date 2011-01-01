var DOM = {
  tabId: null,

  getScriptsCallback: function(response) {
    var scripts = response.scripts;
    
    // if you want to log something, send a message to content.js which lives on
    // the tab page
    chrome.tabs.sendRequest(DOM.tabId, {action: 'consoleLog', data: scripts}, null);
  },

  getScripts: function(tab) {
    DOM.tabId = tab.id;
    chrome.tabs.sendRequest(DOM.tabId, {action: 'getScripts'}, DOM.getScriptsCallback);
  },

  initListeners: function() {
    chrome.browserAction.onClicked.addListener(DOM.getScripts);
  }
};
