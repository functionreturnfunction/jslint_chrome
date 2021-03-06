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

var Content = {
  listenerCallback: function(request, sender, callback) {
    switch (request.action) {
    case 'getScripts': 
      callback({scripts: Content.getPageScripts()});
      break;
    case 'consoleLog':
      console.log(request.data);
      break;
    }
  },

  getPageScripts: function() {
    var scripts = document.getElementsByTagName('script'),
    strings = [], src;
    
    for (var i = scripts.length - 1; i >= 0; --i) {
      src = scripts[i].getAttribute('src');
      if (src) {
        strings.push(src);
      }
    }
    
    return strings;
  },

  initialize: function() {
    chrome.extension.onRequest.addListener(Content.listenerCallback);
  }
};
