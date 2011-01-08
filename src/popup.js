/*
Copyright 2011 Jason Duncan, Nicholas Ortenzio

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

var Popup = {
  DIV_RESULTS: '#results',
  DDL_SCRIPTS: '#script_urls',
  BTN_JSLINT: '#jslint',
  BTN_CANCEL: '#cancel',
  CODE_CSS_CLASS: 'code',

  tabId: null,
  tabUrl: null,

  createScriptRequest: function() {
    return new XMLHttpRequest();
  },

  getScriptsCallback: function(response) {
    Popup.renderScriptUrls(response.scripts);
  },

  getBaseUrl: function() {
    var a = document.createElement('a');
    a.href = Popup.tabUrl;
    return a.protocol + '//' + a.host;
  },

  getPagePath: function() {
    var a = document.createElement('a');
    a.href = Popup.tabUrl;
    return Popup.getBaseUrl() + a.pathname.match(/(.*)\/[^\/]+/)[1] + '/';
  },

  fixRelativeUrl: function(relativeUrl) {
    switch (true) {
      case /^https?:\/\//.test(relativeUrl):
        return relativeUrl;        
      case /^\.\./.test(relativeUrl):
        return Popup.getBaseUrl() + Popup.getPagePath() + relativeUrl;
      default:
        return Popup.getBaseUrl() + relativeUrl;
    }
  },

  htmlEncode: function(str) {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  renderScriptUrls: function(urls) {
    var ddlScripts = $(Popup.DDL_SCRIPTS);
    $.each(urls, function(url) {
      url = Popup.fixRelativeUrl(url);
      ddlScripts.append($('<option></option>')
                        .attr({text: url, value: url}));
    });
  },

  getScripts: function(tab) {
    Popup.tabUrl = tab.url;
    chrome.tabs.sendRequest(
      (Popup.tabId = tab.id), {action: 'getScripts'}, Popup.getScriptsCallback);
  },

  getChosenScriptUrl: function() {
    return $(Popup.DDL_SCRIPTS).val();
  },

  gatherScriptSource: function(url) {
    var request = Popup.createScriptRequest();
    request.open('GET', url, false);
    request.send(null);
    return request.responseText;
  },

  formatError: function(error) {
    return $('<p></p>')
      .html('Problem at line ' + error.line + ', character ' + error.character +
            '<br />Source: <span class="' + Popup.CODE_CSS_CLASS + '">' +
            Popup.htmlEncode(error.evidence) + '</span><br />' + 'Problem: ' +
            error.reason + '<br />');
  },

  renderJSLintResults: function(result) {
    if (result === true) {
      return;
    }

    var results = $(Popup.DIV_RESULTS)
      .css({display: 'block'})
      .html('<h2>Results:</h2>');

    $.each(JSLINT.errors, function(error) {
      if (error != null) {
        results.append(Popup.formatError(error));
      }
    });
  },

  btnJSLint_Click: function() {
    Popup.renderJSLintResults(
      JSLINT(
        Popup.gatherScriptSource(
          Popup.getChosenScriptUrl())));
  },

  btnCancel_Click: function() {
    window.close();
  },

  initializeEvents: function() {
    $(Popup.BTN_JSLINT).click(Popup.btnJSLint_Click);
    $(Popup.BTN_CANCEL).click(Popup.btnCancel_Click);
  },

  initialize: function() {
    chrome.tabs.getSelected(null, Popup.getScripts);
    Popup.initializeEvents();
  }
};
