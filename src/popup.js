var DOM = {
  DDL_SCRIPTS: 'script_urls',

  tabId: null,

  getScriptsCallback: function(response) {
    DOM.renderScriptUrls(response.scripts);
    // if you want to log something, send a message to content.js which lives on
    // the tab page
    // chrome.tabs.sendRequest(DOM.tabId, {action: 'consoleLog', data: scripts}, null);
  },

  renderScriptUrls: function(urls) {
    var ddlScripts = document.getElementById(DOM.DDL_SCRIPTS),
      option;
    for (var i = urls.length - 1; i >= 0; --i) {
      option = document.createElement('option');
      option.innerHTML = option.value = urls[i];
      ddlScripts.appendChild(option);
    }
  },

  getScripts: function(tab) {
    DOM.tabId = tab.id;
    chrome.tabs.sendRequest(DOM.tabId, {action: 'getScripts'}, DOM.getScriptsCallback);
  },

  initListeners: function() {
    chrome.tabs.getSelected(null, DOM.getScripts);
  }
};
