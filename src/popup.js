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

$(function() {

  /*** ELEMENT SELECTORS ***/

  var selectors = {
    buttonClose: '#button_close',
    tabElement: '#lint_tabs',
    scriptList: '#script_urls',
    scriptUrl: '#script_urls a',
    scriptTemplate : '#script_url_tmpl',
    resultsContainer : '#results',
    resultsTemplate : '#jslint_error_tmpl'
  };

  /*** EVENT HANDLERS ***/

  var onClosePopup = function(e) {
    window.close();
  };

  var onScriptClicked = function(e) {
    e.preventDefault();
    $.ajax({url:$(this).attr('href')});
  };

  var onPageScriptsCallback = function(response) {
//    var urls = $.map(response.scripts, function(item) { return {url: Utilities.fixRelativeUrl(item, tabUrl)}; })
    var urls = $.map(response.scripts, function(item) { return {url:item} });
    renderScriptUrls(urls);
  };

  var onScriptBodyAjaxCallback = function(source) {
    var result = JSLINT(source);
    renderJSLintResults(result);
  };

  /*** METHODS ***/

  var getPageScripts = function(tab) {
    tabUrl = tab.url;
    tabId = tab.id;
    chrome.tabs.sendRequest(tab.id, {action:'getScripts'}, onPageScriptsCallback);
  };

  var renderScriptUrls = function(urls) {
    $(selectors.scriptTemplate).tmpl(urls).appendTo(selectors.scriptList);
  };

  var renderJSLintResults = function(result) {
    // what does result===true imply here?
    if (result === true) { return; }

    // $(selectors.resultsTemplate).tmpl(Utilities.cleanupJSLintResults(JSLINT.errors)).appendTo(selectors.resultsContainer);
    $(selectors.resultsTemplate).tmpl(JSLINT.errors).appendTo(selectors.resultsContainer);

    // switch to results tab
  };

  /*** SET EVENTS ***/

  $(selectors.buttonClose).click(onClosePopup);
  $(selectors.scriptUrl).live('click', onScriptClicked);

  /*** INITIALIZE ***/
  
  var tabId, tabUrl;
  $.ajaxSetup({ type:'GET', dataType:'text', success:onScriptBodyAjaxCallback });
  $(selectors.tabElement).tabs();
  chrome.tabs.getSelected(null, getPageScripts);

});