loadScriptDynamically('../../src/popup.js');
module('DOM Script');

test('.initialize uses the chrome.tabs api to call .getScripts with the current tab, and initializes the event handlers for the JSLint and Cancel buttons of the popup', function() {
  jack(function() {
    var btnJSLint = jack.create('btnJSLint', ['addEventListener']);
    var btnCancel = jack.create('btnCancel', ['addEventListener']);

    jack.expect('chrome.tabs.getSelected')
      .mock(noop)
      .withArguments(null, DOM.getScripts);
    jack.expect('document.getElementById')
      .mock(noop)
      .withArguments(DOM.BTN_JSLINT)
      .returnValue(btnJSLint);
    jack.expect('document.getElementById')
      .mock(noop)
      .withArguments(DOM.BTN_CANCEL)
      .returnValue(btnCancel);
    jack.expect('btnJSLint.addEventListener')
      .withArguments('click', DOM.btnJSLint_Click, false);
    jack.expect('btnCancel.addEventListener')
      .withArguments('click', DOM.btnCancel_Click, false);

    DOM.initialize();
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

test('.getScriptsCallback calls .renderScriptUrls with the scripts attribute of the response object', function() {
  var response = {
    scripts: new Object()
  };

  jack(function() {
    jack.expect('DOM.renderScriptUrls')
      .mock(noop)
      .withArguments(response.scripts);

    DOM.getScriptsCallback(response);
  });
});

test('.renderScriptUrls creates option elements and appends them to the scripts select for each script url passed in', function() {
  var option = new Object();
  var scripts = ['foo', 'bar', 'baz'];
  var i = scripts.length - 1;

  jack(function() {
    var ddlScripts = jack.create('ddlScripts', ['appendChild']);

    jack.expect('document.getElementById')
      .mock(noop)
      .exactly('1 times')
      .withArguments(DOM.DDL_SCRIPTS)
      .returnValue(ddlScripts);
    jack.expect('document.createElement')
      .mock(noop)
      .exactly(scripts.length + ' times')
      .withArguments('option')
      .returnValue(option);
    jack.expect('ddlScripts.appendChild')
      .exactly(scripts.length + ' times')
      .mock(function(option) {
        equals(scripts[i--], option.value);
        equals(option.value, option.innerHTML);
      })
      .withArguments(option);

    DOM.renderScriptUrls(scripts);
  });
});
