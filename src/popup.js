/*
Copyright 2011 Jason Duncan

This file is part of the JSLint Extension for Google Chrome.

The JSLint Extension for Google Chrome is free software: you can redistribute it
and/or modify it under the terms of the GNU General Public License as published
by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

The JSLint Extension for Google Chrome is distributed in the hope that it will
be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public
License for more details.

You should have received a copy of the GNU General Public License along with the
JSLint Extension for Google Chrome.  If not, see <http://www.gnu.org/licenses/>.
*/

var DOM = {
  DIV_RESULTS: 'results',
  DDL_SCRIPTS: 'script_urls',
  BTN_JSLINT: 'jslint',
  BTN_CANCEL: 'cancel',

  tabId: null,

  createScriptRequest: function() {
    return new XMLHttpRequest();
  },

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

  getChosenScriptUrl: function() {
    var ddlScripts = document.getElementById(DOM.DDL_SCRIPTS);
    return ddlScripts.options[ddlScripts.selectedIndex].value;
  },

  gatherScriptSource: function(url) {
    var request = DOM.createScriptRequest();
    request.open('GET', url, false);
    request.send(null);
    return request.responseText;
  },

  formatError: function(error) {
    var p = document.createElement('p');
    p.innerHTML = 'Problem at line ' + error.line + ', character ' +
      error.character + '<br />Source: ' + error.evidence + '<br />' +
      'Problem: ' + error.reason + '<br />';
    return p;
  },

  renderJSLintResults: function(result) {
    if (result === true) {
      return;
    }

    var results = document.getElementById(DOM.DIV_RESULTS), error;
    results.style.display = 'block';
    for (var i = 0, len = JSLINT.errors.length; i < len; ++i) {
      error = JSLINT.errors[i];
      if (error != null) {
        results.appendChild(
          DOM.formatError(error));
      }
    }
  },

  btnJSLint_Click: function() {
    DOM.renderJSLintResults(
      JSLINT(
        DOM.gatherScriptSource(
          DOM.getChosenScriptUrl())));
  },

  initialize: function() {
    chrome.tabs.getSelected(null, DOM.getScripts);
    document.getElementById(DOM.BTN_JSLINT)
      .addEventListener('click', DOM.btnJSLint_Click, false);
    document.getElementById(DOM.BTN_CANCEL)
      .addEventListener('click', DOM.btnCancel_Click, false);
  }
};
