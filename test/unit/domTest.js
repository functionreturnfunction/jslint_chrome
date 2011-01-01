loadScriptDynamically('../../src/dom.js');
module('DOM Script');

test('.initListeners adds getScripts as an event listener for the browserAction onClicked event', function() {
  jack(function() {
    jack.expect('chrome.browserAction.onClicked.addListener')
      .mock(noop)
      .withArguments(DOM.getScripts);

    DOM.initListeners();
  });
});

test('.getScripts sends a request to the given tab with the "getScripts" action and getScriptsCallback, and sets the tabId', function() {
  var tab = {id: 1234};

  jack(function() {
    jack.expect('chrome.tabs.sendRequest')
      .mock(function(tabId, request, cb) {
        equals(tab.id, tabId);
        equals('getScripts', request.action);
        same(DOM.getScriptsCallback, cb);
      });

    DOM.getScripts(tab);

    equals(tab.id, DOM.tabId)
  });
});