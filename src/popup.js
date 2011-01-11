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
  initialize: function(e){ chrome.tabs.getSelected(null, Popup.methods.getPageScripts); },
  tab: null
};


/*** ELEMENT SELECTORS ***/

Popup.selectors = {
  buttonClose: '#button_close',
  tabElement: '#lint_tabs',
  scriptTab: '#tab_scripts',
  scriptList: '#script_urls',
  scriptUrl: '#script_urls a',
  scriptTemplate : '#script_url_tmpl',
  resultsTab : '#tab_results',
  resultsContainer : '#results',
  resultsTemplate : '#jslint_error_tmpl'
};


/*** EVENT HANDLERS ***/

Popup.callbacks = {

  onClosePopup : function(e) {
    window.close();
  },

  onScriptClicked : function(e) {
    e.preventDefault();
    $.ajax({url:$(this).attr('href')});
  },

  onPageScriptsCallback : function(response) {
    //  var urls = $.map(response.scripts, function(item) { return {url: Popup.utilities.fixRelativeUrl(item, Popup.tab.url)}; })
    var urls = $.map(response.scripts, function(item) { return {url:item} });
    Popup.methods.renderScriptUrls(urls);
  },

  onScriptBodyAjaxCallback : function(source) {
    var result = JSLINT(source);
    Popup.methods.renderJSLintResults(result);
  }

};


/*** METHODS ***/

Popup.methods = {

  getPageScripts : function(tab) {
    Popup.tab = tab;
    chrome.tabs.sendRequest(tab.id, {action:'getScripts'}, Popup.callbacks.onPageScriptsCallback);
  },

  renderScriptUrls : function(urls) {
    $(Popup.selectors.scriptTemplate).tmpl(urls).appendTo(Popup.selectors.scriptList);
  },

  renderJSLintResults : function(result) {
    if (result === true) { return; }

    var results = Popup.utilities.cleanupJSLintResults(JSLINT.errors);

    $(Popup.selectors.resultsTemplate).tmpl(results).appendTo(Popup.selectors.resultsContainer);
    $(Popup.selectors.tabElement).tabs('navTo', Popup.selectors.resultsTab);
  }

};


/*** UTILITIES ***/

Popup.utilities = {

  getBaseUrl: function(url) {
    with ($.url.setUrl(url)) {
      return attr('protocol') + '://' + (attr('host') || '');
    }
  },

  getPagePath: function(url) {
    return $.url.setUrl(tabUrl).attr('directory');
  },


  fixRelativeUrl: function(relativeUrl, tabUrl) {
    var baseUrl = Popup.utilities.getBaseUrl(tabUrl);
    var pagePath = Popup.utilities.getPagePath(tabUrl);

    switch (true) {
      case /^https?:\/\//.test(relativeUrl):
        return relativeUrl;
      case /^\/\//.test(relativeUrl):
        return $.url.setUrl(tabUrl).attr('protocol') + ':' + relativeUrl;
      case /^\//.test(relativeUrl):
        return baseUrl + relativeUrl;
      default:
        return baseUrl + pagePath + relativeUrl;
    }
  },

  htmlEncode: function(str) {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  cleanupJSLintResults: function(results) {
    var ret = [];
    $.each(results, function(i, item) {
      if (item !== null) {
        item.evidence = item.hasOwnProperty('evidence') ? Popup.utilities.htmlEncode(item.evidence) : '<none>';
        ret.push(item);
      }
    });
    return ret;
  }

}


$(function() {

  /*** SET DOM EVENTS ***/

  $(Popup.selectors.buttonClose).click(Popup.onClosePopup);
  $(Popup.selectors.scriptUrl).live('click', Popup.callbacks.onScriptClicked);

  /*** INITIALIZE ***/
  
  $.ajaxSetup({type:'GET', dataType:'text', success:Popup.callbacks.onScriptBodyAjaxCallback });
  $(Popup.selectors.tabElement).tabs();
  Popup.initialize();

});