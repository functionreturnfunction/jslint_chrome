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


var Utilities = {

  getBaseUrl: function(url) {
    with ($.url.setUrl(url)) {
      return attr('protocol') + '://' + (attr('host') || '');
    }
  },

  getPagePath: function(url) {
    return $.url.setUrl(tabUrl).attr('directory');
  },


  fixRelativeUrl: function(relativeUrl, tabUrl) {
    var baseUrl = getBaseUrl(tabUrl);
    var pagePath = getPagePath(tabUrl);

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
        item.evidence = item.hasOwnProperty('evidence') ?
          Utilities.htmlEncode(item.evidence) : '<none>';
        ret.push(item);
      }
    });
    return ret;
  }

}