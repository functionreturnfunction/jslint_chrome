loadScriptDynamically('../../src/content.js');

//////////////////////////////////MOCKING//////////////////////////////////
var Script = function(src) {
  this.src = src;
};

Script.prototype.getAttribute = function(attr) {
  return this[attr];
};

module('Content Script');

test('listenerCallback sends response with result from getPageScripts when request action is "getScripts"', function() {
  var request = {
    action: 'getScripts'
  };
  var pageScripts = new Object();
  var sendResponseCalled = false;
  var sendResponse = function(response) {
    sendResponseCalled = true;
    same(pageScripts, response.scripts);
  };

  jack(function() {
    jack.expect('getPageScripts')
      .mock(noop)
      .returnValue(pageScripts);

    listenerCallback(request, null, sendResponse);
  });
  
  ok(sendResponseCalled);
});

test('listenerCallback logs request data to console if request action is "consoleLog"', function() {
  var request = {
    action: 'consoleLog',
    data: new Object()
  };

  jack(function() {
    jack.expect('console.log')
      .mock(noop)
      .withArguments(request.data);

    listenerCallback(request, null, null);
  });
});

test('getPageScripts returns array of src attributes for all scripts in the current page', function() {
  var scripts = [
    new Script('this is a valid script'),
    new Script('this is too'),
    new Script() // this is not valid and should not be returned
  ], retVal;

  jack(function() {
    jack.expect('document.getElementsByTagName')
      .mock(noop)
      .withArguments('script')
      .returnValue(scripts);

    retVal = getPageScripts();
  });

  equals(2, retVal.length);
  same(scripts[0].src, retVal[1]);
  same(scripts[1].src, retVal[0]);
});

test('initListener adds listenerCallback as an event handler for chrome.extension.onRequest', function() {
  jack(function() {
    jack.expect('chrome.extension.onRequest.addListener')
      .mock(noop)
      .withArguments(listenerCallback);

    initListener();
  });
});
