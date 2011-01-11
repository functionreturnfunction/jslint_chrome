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
  DIV_SCRIPTS: '#script_urls',
  BTN_JSLINT: '.script_url',
  BTN_CANCEL: '.cancel',
  TMPL_SCRIPT_URLS: '#script_url_tmpl',
  TMPL_JSLINT_ERROR: '#jslint_error_tmpl',
  SCRIPTS_LOADED: '.scripts_loaded',
  NO_SCRIPTS_LOADED: '.no_scripts_loaded',
  CODE_CSS_CLASS: 'code',

  tabId: null,
  tabUrl: null,

  getScriptsCallback: function(response) {
    $(Popup.SCRIPTS_LOADED).show();
    $(Popup.NO_SCRIPTS_LOADED).hide();
    Popup.renderScriptUrls($.map(response.scripts, function(item) {
      return {url: Popup.fixRelativeUrl(item)};
    }));
  },

  getScriptBodyCallback: function(source) {
    Popup.renderJSLintResults(JSLINT(source));
  },

  getBaseUrl: function() {
    with ($.url.setUrl(Popup.tabUrl)) {
      return attr('protocol') + '://' + (attr('host') || '');
    }
  },

  getPagePath: function() {
    return $.url.setUrl(Popup.tabUrl).attr('directory');
  },

  fixRelativeUrl: function(relativeUrl) {
    switch (true) {
      case /^https?:\/\//.test(relativeUrl):
        return relativeUrl;
      case /^\/\//.test(relativeUrl):
        return $.url.setUrl(Popup.tabUrl).attr('protocol') + ':' + relativeUrl;
      case /^\//.test(relativeUrl):
        return Popup.getBaseUrl() + relativeUrl;
      default:
        return Popup.getBaseUrl() + Popup.getPagePath() + relativeUrl;
    }
  },

  htmlEncode: function(str) {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  renderScriptUrls: function(urls) {
    $(Popup.TMPL_SCRIPT_URLS).tmpl(urls).appendTo(Popup.DIV_SCRIPTS);
    $(Popup.BTN_JSLINT).click(Popup.btnJSLint_Click);
  },

  getScripts: function(tab) {
    Popup.tabUrl = tab.url;
    chrome.tabs.sendRequest((Popup.tabId = tab.id), {action: 'getScripts'},
                            Popup.getScriptsCallback);
  },

  cleanupJSLintResults: function(results) {
    var ret = [];
    $.each(results, function(i, item) {
      if (item !== null) {
        item.evidence = item.hasOwnProperty('evidence') ?
          Popup.htmlEncode(item.evidence) : '<none>';
        ret.push(item);
      }
    });
    return ret;
  },

  renderJSLintResults: function(result) {
    if (result === true) {
      return;
    }

    var resultsDiv = $(Popup.DIV_RESULTS)
      .show()
      .html('<h2>Results:</h2>');

    $(Popup.TMPL_JSLINT_ERROR)
      .tmpl(Popup.cleanupJSLintResults(JSLINT.errors))
      .appendTo(resultsDiv);
  },

  btnJSLint_Click: function() {
    $.ajax({
      url: $(this).text(),
      type: 'GET',
      dataType: 'text',
      success: Popup.getScriptBodyCallback
    });
  },

  btnCancel_Click: function() {
    window.close();
  },

  initializeEvents: function() {
    $(Popup.BTN_CANCEL).click(Popup.btnCancel_Click);
  },

  initialize: function() {
    chrome.tabs.getSelected(null, Popup.getScripts);
    Popup.initializeEvents();
  }
};
