module('DOM Script');

test('loading script adds a listener for the onClicked event of the browserAction which will send a "getScripts" request to the current tab', function() {
  jack(function() {
    var tab = {
      id: 1234
    };
    var theCallback;

    jack.expect('chrome.browserAction.onClicked.addListener')
      .mock(function(fn) {
        theCallback = fn;
      });
    
    loadScriptDynamically('../../src/dom.js');

    jack.expect('chrome.tabs.sendRequest')
      .mock(function(tabId, request, cb) {
        equals(tabId, tab.id);
        equals(request.action, 'getScripts');
        same(cb, callback);
      });

    theCallback(tab);
  });
});
