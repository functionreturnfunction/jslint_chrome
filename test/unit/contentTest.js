module('Content Script');

test('adds an event listener for onRequest which will respond using the specified callback', function() {
  jack(function() {
    var request = {
      action: 'getScripts'
    };
    var callbackCalled = false;
    var callback = function(arg) {
      callbackCalled = true;
    };

    jack.expect('chrome.extension.onRequest.addListener')
      .mock(function(fn) {
        fn(request, null, callback);
      });

    loadScriptDynamically('../../src/content.js');

    ok(callbackCalled);
  });
});
