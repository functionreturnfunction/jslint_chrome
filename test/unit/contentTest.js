loadScriptDynamically('../../src/content.js');
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
