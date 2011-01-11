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
  /*** ELEMENT SELECTORS ***/
  selectors: {
    buttonClose: '#button_close',
    tabElement: '#lint_tabs',
    scriptTab: '#tab_scripts',
    scriptList: '#script_urls',
    scriptUrl: '#script_urls a',
    scriptTemplate : '#script_url_tmpl',
    resultsTab : '#tab_results',
    resultsContainer : '#results',
    resultsTemplate : '#jslint_error_tmpl'
  },

  /*** EVENT HANDLERS ***/
  onClosePopup: function(e) {
    window.close();
  },

  onScriptClicked: function(e) {
    e.preventDefault();
    $.ajax({url:$(this).attr('href')});
  },

  onPageScriptsCallback: function(response) {
//    var urls = $.map(response.scripts, function(item) { return {url: Utilities.fixRelativeUrl(item, tabUrl)}; })
    var urls = $.map(response.scripts, function(item) { return {url:item} });
    renderScriptUrls(urls);
  },

  onScriptBodyAjaxCallback: function(source) {
    var result = JSLINT(source);
    renderJSLintResults(result);
  },

  /*** METHODS ***/
  getPageScripts: function(tab) {
    tabUrl = tab.url;
    tabId = tab.id;
    chrome.tabs.sendRequest(
      tab.id, {action:'getScripts'}, Popup.onPageScriptsCallback);
  },

  renderScriptUrls: function(urls) {
    $(selectors.scriptTemplate).tmpl(urls).appendTo(selectors.scriptList);
  },

  renderJSLintResults: function(result) {
    // what does result===true imply here?
    if (result === true) { return; }

    // $(selectors.resultsTemplate).tmpl(Utilities.cleanupJSLintResults(JSLINT.errors)).appendTo(selectors.resultsContainer);
    $(selectors.resultsTemplate).tmpl(JSLINT.errors).appendTo(selectors.resultsContainer);

    // switch to results tab
    $(selectors.tabElement).tabs('navTo', selectors.resultsTab);
  },

  /*** SET EVENTS ***/
  initializeEvents: function() {
    $(Popup.selectors.buttonClose).click(Popup.onClosePopup);
    $(Popup.selectors.scriptUrl).live('click', Popup.onScriptClicked);
  },

  /*** INITIALIZE ***/

  initialize: function() {
    $.ajaxSetup({
      type: 'GET',
      dataType: 'text',
      success: Popup.onScriptBodyAjaxCallback
    });
    $(Popup.selectors.tabElement).tabs();
    chrome.tabs.getSelected(null, Popup.getPageScripts);
  }
};
