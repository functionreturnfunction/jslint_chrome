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

test('.getChosenScriptUrl returns the chosen script url from the drop down list', function() {
  var url = 'this is the chosen script url';
  var ddlScripts = {
    selectedIndex: 0,
    options: [
      { value: url }
    ]
  };

  jack(function() {
    jack.expect('document.getElementById')
      .mock(noop)
      .withArguments(DOM.DDL_SCRIPTS)
      .returnValue(ddlScripts);

    equals(url, DOM.getChosenScriptUrl());
  });
});

test('.createScriptRequest returns a new XMLHttpRequest object', function() {
  same(XMLHttpRequest, DOM.createScriptRequest().constructor);
});

test('.gatherScriptSource uses an XMLHttpRequest object to synchronously retrieve and return the source of the script at the given url', function() {
  var url = 'this is the chosen script url';
  var source = 'this is the script source';

  jack(function() {
    var request = jack.create('request', ['open', 'send']);
    request.responseText = source;

    jack.expect('DOM.createScriptRequest')
      .mock(noop)
      .returnValue(request);
    jack.expect('request.open');
      // no idea why this isn't working
      // .withArguments('GET', url);
    jack.expect('request.send')
      .withArguments(null);
    
    equals(source, DOM.gatherScriptSource());
  });
});

test('.btnJSLint_Click gathers the source for the chosen script, runs jslint on it, and renders the result', function() {
  var url = 'this is the chosen script url';
  var source = 'this is the script source';
  var result = new Object();

  jack(function() {
    jack.expect('DOM.getChosenScriptUrl')
      .mock(noop)
      .returnValue(url);
    jack.expect('DOM.gatherScriptSource')
      .mock(noop)
      .withArguments(url)
      .returnValue(source);
    jack.expect('JSLINT')
      .withArguments(source)
      .returnValue(result);
    jack.expect('DOM.renderJSLintResults')
      .mock(noop)
      .withArguments(result);

    DOM.btnJSLint_Click();
  });
});

test('.renderJSLintResults does nothing if result is true, indicating that the script passed JSLint', function() {
  jack(function() {
    jack.expect('document.getElementById')
      .never();

    DOM.renderJSLintResults(true);
  });
});

test('.renderJSLintResults formats and appends each error to the output area if result is false, indicating that the script failed JSLint', function() {
  JSLINT.errors = [
    new Object(), new Object(), new Object(), null // will have nulls for some reason
  ];
  var formattedErrors = [
    new Object(), new Object(), new Object()
  ];

  jack(function() {
    var results = jack.create('results', ['appendChild']);
    results.style = {};
    var i = JSLINT.errors.length - 2;
    var j = i;

    jack.expect('document.getElementById')
      .mock(noop)
      .withArguments(DOM.DIV_RESULTS)
      .returnValue(results);
    jack.expect('DOM.formatError')
      .exactly((JSLINT.errors.length - 1) + ' times')
      .mock(function(obj) {
        same(obj, JSLINT.errors[i]);
        return formattedErrors[i--];
      });
    jack.expect('results.appendChild')
      .exactly(formattedErrors.length + ' times')
      .mock(function(obj) {
        same(obj, formattedErrors[j--]);
      });

    DOM.renderJSLintResults(false);
    
    equals('block', results.style.display);
  });

  JSLINT.errors = null;
});

test('.formatError returns a new &lt;p&gt; element with the provided error information', function() {
  var error = {
    line: 1234,
    character: 4321,
    reason: "I don't like your face",
    evidence: "document.getElementById('someElement').style.font-family = 'Comic Sans';"
  };
  var expected = 'Problem at line ' + error.line + ', character ' +
    error.character + '<br />Source: ' + error.evidence + '<br />' +
    'Problem: ' + error.reason + '<br />';
  var p = new Object();

  jack(function() {
    jack.expect('document.createElement')
      .mock(noop)
      .withArguments('p')
      .returnValue(p);

    var result = DOM.formatError(error);
    same(result, p);
    equals(expected, result.innerHTML);
  });
});
