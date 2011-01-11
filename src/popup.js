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

    alert(JSLINT.errors[0].reason);

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