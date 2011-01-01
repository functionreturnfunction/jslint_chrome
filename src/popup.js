var DOM = {
  DDL_SCRIPTS: 'script_urls',

  tabId: null,

  getScriptsCallback: function(response) {
    DOM.renderScriptUrls(response.scripts);
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
    chrome.tabs.sendRequest(
      (DOM.tabId = tab.id), {action: 'getScripts'}, DOM.getScriptsCallback);
  },

  initialize: function() {
    chrome.tabs.getSelected(null, DOM.getScripts);
  }
};
