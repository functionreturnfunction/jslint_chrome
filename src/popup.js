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
    renderJSLintResults(JSLINT(source));
  };

  /*** METHODS ***/

  var getPageScripts = function(tab) {
    tabUrl = tab.url;
    tabId = tab.id;
    chrome.tabs.sendRequest(tab.id, {action:'getScripts'}, onPageScriptsCallback);
  };

  var renderScriptUrls = function(urls) {
    var x = $(selectors.scriptTemplate).tmpl(urls);
    x.appendTo(selectors.scriptList);
  };

  var renderJSLintResults = function(result) {
    if (result === true) { return; }
    $(selectors.resultsTemplate).tmpl(Utilities.cleanupJSLintResults(JSLINT.errors)).appendTo(selectors.resultsContainer);
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