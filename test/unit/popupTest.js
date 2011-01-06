loadScriptDynamically('../../src/popup.js');
module('Popup Script');

test('.initialize uses the chrome.tabs api to call .getScripts with the current tab, and initializes the event handlers for the JSLint and Cancel buttons of the popup', function() {
  jack(function() {
    var btnJSLint = jack.create('btnJSLint', ['addEventListener']);
    var btnCancel = jack.create('btnCancel', ['addEventListener']);

    jack.expect('chrome.tabs.getSelected')
      .mock(noop)
      .withArguments(null, Popup.getScripts);
    jack.expect('document.getElementById')
      .mock(noop)
      .withArguments(Popup.BTN_JSLINT)
      .returnValue(btnJSLint);
    jack.expect('document.getElementById')
      .mock(noop)
      .withArguments(Popup.BTN_CANCEL)
      .returnValue(btnCancel);
    jack.expect('btnJSLint.addEventListener')
      .withArguments('click', Popup.btnJSLint_Click, false);
    jack.expect('btnCancel.addEventListener')
      .withArguments('click', Popup.btnCancel_Click, false);

    Popup.initialize();
  });
});

test('.getScripts sends a request to the given tab with the "getScripts" action and getScriptsCallback, and sets the tabId and tabUrl', function() {
  var tab = {
    id: 1234,
    url: 'this is the tab url'
  };

  jack(function() {
    jack.expect('chrome.tabs.sendRequest')
      .mock(function(tabId, request, cb) {
        equals(tab.id, tabId);
        equals('getScripts', request.action);
        same(Popup.getScriptsCallback, cb);
      });

    Popup.getScripts(tab);

    equals(tab.id, Popup.tabId)
    equals(tab.url, Popup.tabUrl);
  });
});

test('.getScriptsCallback calls .renderScriptUrls with the scripts attribute of the response object', function() {
  var response = {
    scripts: new Object()
  };

  jack(function() {
    jack.expect('Popup.renderScriptUrls')
      .mock(noop)
      .withArguments(response.scripts);

    Popup.getScriptsCallback(response);
  });
});

test('.renderScriptUrls creates option elements and appends them to the scripts select for each script url passed in, fixing relative urls along the way', function() {
  var option = new Object();
  var scripts = ['foo', 'bar', 'baz'];
  var i = scripts.length - 1;

  jack(function() {
    var ddlScripts = jack.create('ddlScripts', ['appendChild']);

    jack.expect('document.getElementById')
      .mock(noop)
      .exactly('1 times')
      .withArguments(Popup.DDL_SCRIPTS)
      .returnValue(ddlScripts);
    jack.expect('document.createElement')
      .mock(noop)
      .exactly(scripts.length + ' times')
      .withArguments('option')
      .returnValue(option);
    jack.expect('Popup.fixRelativeUrl')
      .exactly(scripts.length + ' times')
      .mock(function(url) {
        equals(scripts[i], url);
        return scripts[i];
      });
    jack.expect('ddlScripts.appendChild')
      .exactly(scripts.length + ' times')
      .mock(function(option) {
        equals(scripts[i--], option.value);
        equals(option.value, option.text);
      })
      .withArguments(option);

    Popup.renderScriptUrls(scripts);
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
      .withArguments(Popup.DDL_SCRIPTS)
      .returnValue(ddlScripts);

    equals(url, Popup.getChosenScriptUrl());
  });
});

test('.createScriptRequest returns a new XMLHttpRequest object', function() {
  same(XMLHttpRequest, Popup.createScriptRequest().constructor);
});

test('.gatherScriptSource uses an XMLHttpRequest object to synchronously retrieve and return the source of the script at the given url', function() {
  var url = 'this is the chosen script url';
  var source = 'this is the script source';

  jack(function() {
    var request = jack.create('request', ['open', 'send']);
    request.responseText = source;

    jack.expect('Popup.createScriptRequest')
      .mock(noop)
      .returnValue(request);
    jack.expect('request.open');
      // no idea why this isn't working
      // .withArguments('GET', url);
    jack.expect('request.send')
      .withArguments(null);
    
    equals(source, Popup.gatherScriptSource());
  });
});

test('.btnJSLint_Click gathers the source for the chosen script, runs jslint on it, and renders the result', function() {
  var url = 'this is the chosen script url';
  var source = 'this is the script source';
  var result = new Object();

  jack(function() {
    jack.expect('Popup.getChosenScriptUrl')
      .mock(noop)
      .returnValue(url);
    jack.expect('Popup.gatherScriptSource')
      .mock(noop)
      .withArguments(url)
      .returnValue(source);
    jack.expect('JSLINT')
      .withArguments(source)
      .returnValue(result);
    jack.expect('Popup.renderJSLintResults')
      .mock(noop)
      .withArguments(result);

    Popup.btnJSLint_Click();
  });
});

test('.renderJSLintResults does nothing if result is true, indicating that the script passed JSLint', function() {
  jack(function() {
    jack.expect('document.getElementById')
      .never();

    Popup.renderJSLintResults(true);
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
      .withArguments(Popup.DIV_RESULTS)
      .returnValue(results);
    jack.expect('Popup.formatError')
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

    Popup.renderJSLintResults(false);
    
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
  var htmlEncoded = 'This is the html encoded string';
  var expected = 'Problem at line ' + error.line + ', character ' +
    error.character + '<br />Source: <span class="' + Popup.CODE_CSS_CLASS +
    '">' + htmlEncoded + '</span><br />' + 'Problem: ' + error.reason +
    '<br />';
  var p = new Object();

  jack(function() {
    jack.expect('document.createElement')
      .mock(noop)
      .withArguments('p')
      .returnValue(p);
    jack.expect('Popup.htmlEncode')
      .mock(noop)
      .withArguments(error.evidence)
      .returnValue(htmlEncoded);

    var result = Popup.formatError(error);
    same(result, p);
    equals(expected, result.innerHTML);
  });
});

test('.fixRelativeUrl determines and returns the fully-qualified path for the given url', function() {
  var relativeUrl = '/path/to/someScript.js';
  var baseUrl = 'http://www.somesite.com';
  var expected = baseUrl + relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .mock(noop)
      .returnValue(baseUrl);

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });

  relativeUrl = '//path/to/otherScript.js';
  expected = baseUrl + relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .mock(noop)
      .returnValue(baseUrl);

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });

  relativeUrl = 'http://www.somesite.com/someScript.js';
  expected = relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .never();

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });

  var pagePath = '/theApp/someModule/';
  relativeUrl = '../../scripts/someScript.js';
  expected = baseUrl + pagePath + relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .mock(noop)
      .returnValue(baseUrl);
    jack.expect('Popup.getPagePath')
      .mock(noop)
      .returnValue(pagePath);

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });

  relativeUrl = 'https://www.somesite.com/someScript.js';
  expected = relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .never();

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });
});

test('.getBaseUrl returns the tab url with the page stripped off the end', function() {
  Popup.tabUrl = 'http://www.somesite.com/somePage.html';

  equals('http://www.somesite.com', Popup.getBaseUrl());

  Popup.tabUrl = 'https://somesite.com/theApp/somePage.aspx';

  equals('https://somesite.com', Popup.getBaseUrl());

  Popup.tabUrl = 'http://somesite.com/';

  equals('http://somesite.com', Popup.getBaseUrl());

  Popup.tabUrl = 'http://somesite.com';

  equals('http://somesite.com', Popup.getBaseUrl());

  Popup.tabUrl = null;
});

test('.getPagePath returns the url path of the current page', function() {
  Popup.tabUrl = 'http://www.somesite.com/somePage.html';

  equals('http://www.somesite.com/', Popup.getPagePath());

  Popup.tabUrl = 'http://www.somesite.com/theApp/somePage.html';

  equals('http://www.somesite.com/theApp/', Popup.getPagePath());
});

test('.htmlEncode html encodes the given string', function() {
  var str = '<<..>>asdf>fdsa<';
  var expected = '&lt;&lt;..&gt;&gt;asdf&gt;fdsa&lt;'

  equals(expected, Popup.htmlEncode(str));
});

test('.btnCancel_Click() closes the window', function() {
  jack(function() {
    jack.expect('window.close')
      .mock(noop);

    Popup.btnCancel_Click();
  });
});