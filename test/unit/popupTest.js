loadScriptDynamically('../../src/popup.js');
module('Popup Script');

test('.initialize uses the chrome.tabs api to call .getScripts with the current tab, and calls Popup.initializeEvents', function() {
  jack(function() {
    jack.expect('chrome.tabs.getSelected')
      .mock(noop)
      .withArguments(null, Popup.getScripts);
    jack.expect('Popup.initializeEvents')
      .mock(noop);

    Popup.initialize();
  });
});

test('.initializeEvents initializes the click event handlers for the JSLint and Cancel buttons', function() {
  jack(function() {
    var btnJSLint = jack.create('btnJSLint', ['click']);
    var btnCancel = jack.create('btnCancel', ['click']);

    jack.expect('$')
      .mock(noop)
      .withArguments(Popup.BTN_JSLINT)
      .returnValue(btnJSLint);
    jack.expect('$')
      .mock(noop)
      .withArguments(Popup.BTN_CANCEL)
      .returnValue(btnCancel);
    jack.expect('btnJSLint.click')
      .withArguments(Popup.btnJSLint_Click);
    jack.expect('btnCancel.click')
      .withArguments(Popup.btnCancel_Click);
    
    Popup.initializeEvents();
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

test('.getScriptsCallback calls .renderScriptUrls with the scripts attribute of the response object mapped to objects with a url property, fixing relative urls along the way', function() {
  var scripts = ['foo', 'bar'];
  var altered = ['fooAltered', 'barAltered']
  var response = {
    scripts: scripts
  };
  var i = 0;

  jack(function() {
    jack.expect('Popup.fixRelativeUrl')
      .exactly(scripts.length + ' times')
      .mock(function(item) {
        equals(scripts[i], item);
        return altered[i++];
      });
    jack.expect('Popup.renderScriptUrls')
      .mock(function(items) {
        equals(items[0].url, altered[0]);
        equals(items[1].url, altered[1]);
      });

    Popup.getScriptsCallback(response);
  });
});

test('.renderScriptUrls renders given url objects using the script url template into the scripts drop down', function() {
  var scripts = new Object();

  jack(function() {
    var template = jack.create('template', ['tmpl', 'appendTo']);

    jack.expect('$')
      .withArguments(Popup.TMPL_SCRIPT_URLS)
      .returnValue(template);
    jack.expect('template.tmpl')
      .withArguments(scripts)
      .returnValue(template);
    jack.expect('template.appendTo')
      .withArguments(Popup.DDL_SCRIPTS);
    
    Popup.renderScriptUrls(scripts);
  });
});

test('.getChosenScriptUrl returns the chosen script url from the drop down list', function() {
  var url = 'this is the chosen script url';

  jack(function() {
    var ddlScripts = jack.create('ddlScripts', ['val']);

    jack.expect('$')
      .mock(noop)
      .withArguments(Popup.DDL_SCRIPTS)
      .returnValue(ddlScripts);
    jack.expect('ddlScripts.val')
      .mock(noop)
      .returnValue(url);

    equals(url, Popup.getChosenScriptUrl());
  });
});

test('.btnJSLint_Click makes an ajax request to the chosen script url using Popup.getScriptBodyCallback', function() {
  var url = 'this is the chosen script url';

  jack(function() {
    jack.expect('Popup.getChosenScriptUrl')
      .mock(noop)
      .returnValue(url);
    jack.expect('$.ajax')
      .mock(function (opts) {
        equals(url, opts.url);
        equals('GET', opts.type);
        equals('text', opts.dataType);
        equals(Popup.getScriptBodyCallback, opts.success);
      });

    Popup.btnJSLint_Click();
  });
});

test('.renderJSLintResults does nothing if result is true, indicating that the script passed JSLint', function() {
  jack(function() {
    jack.expect('$')
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
    var results = jack.create('results', ['append', 'css', 'html']);
    var i = JSLINT.errors.length - 2;
    var j = i;

    jack.expect('$')
      .mock(noop)
      .withArguments(Popup.DIV_RESULTS)
      .returnValue(results);
    jack.expect('Popup.formatError')
      .exactly((JSLINT.errors.length - 1) + ' times')
      .mock(function(obj) {
        same(obj, JSLINT.errors[i]);
        return formattedErrors[i--];
      });
    jack.expect('results.html')
      .withArguments('<h2>Results:</h2>')
      .returnValue(results);
    jack.expect('results.css')
      .mock(function(opts) {
        equals('block', opts.display);
        return results;
      });
    jack.expect('results.append')
      .exactly(formattedErrors.length + ' times')
      .mock(function(obj) {
        same(obj, formattedErrors[j--]);
      });

    Popup.renderJSLintResults(false);
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

  jack(function() {
    var p = jack.create('p', ['html']);

    jack.expect('$')
      .mock(noop)
      .withArguments('<p></p>')
      .returnValue(p);
    jack.expect('p.html')
      .withArguments(expected)
      .returnValue(p);
    jack.expect('Popup.htmlEncode')
      .mock(noop)
      .withArguments(error.evidence)
      .returnValue(htmlEncoded);

    same(p, Popup.formatError(error));
  });
});

test('.fixRelativeUrl determines and returns the fully-qualified path for the given url', function() {
  // relative from root
  var relativeUrl = '/path/to/someScript.js';
  var baseUrl = 'http://www.somesite.com';
  var expected = baseUrl + relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .mock(noop)
      .returnValue(baseUrl);

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });

  // relative from root
  relativeUrl = '//path/to/otherScript.js';
  expected = baseUrl + relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .mock(noop)
      .returnValue(baseUrl);

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });

  // not relative, explicit
  relativeUrl = 'http://www.somesite.com/someScript.js';
  expected = relativeUrl;

  jack(function() {
    jack.expect('Popup.getBaseUrl')
      .never();

    equals(expected, Popup.fixRelativeUrl(relativeUrl));
  });

  // relative using special chars
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

  // relative from current page path
  relativeUrl = 'someScript.js';
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
});

test('.getBaseUrl returns the tab url with the page stripped off the end', function() {
  var protocol = 'http';
  var host = 'www.somesite.com';
  var url = protocol + '://' + host + '/somePage.html';
  var oldJQueryUrl = $.url;
  Popup.tabUrl = url;

  jack(function() {
    var urlObj = jack.create('urlObj', ['setUrl', 'attr']);
    $.url = urlObj;

    jack.expect('urlObj.setUrl')
      .withArguments(url)
      .returnValue(urlObj);
    jack.expect('urlObj.attr')
      .withArguments('protocol')
      .returnValue(protocol);
    jack.expect('urlObj.attr')
      .withArguments('host')
      .returnValue(host);

    equals(protocol + '://' + host, Popup.getBaseUrl());
  });

  $.url = oldJQueryUrl;
  Popup.tabUrl = null;
});

test('.getBaseUrl does not include host if null', function() {
  var protocol = 'file';
  var host = null;
  var url = protocol + ':///somePage.html';
  var oldJQueryUrl = $.url;
  Popup.tabUrl = url;

  jack(function() {
    var urlObj = jack.create('urlObj', ['setUrl', 'attr']);
    $.url = urlObj;

    jack.expect('urlObj.setUrl')
      .withArguments(url)
      .returnValue(urlObj);
    jack.expect('urlObj.attr')
      .withArguments('protocol')
      .returnValue(protocol);
    jack.expect('urlObj.attr')
      .withArguments('host')
      .returnValue(host);

    equals(protocol + '://', Popup.getBaseUrl());
  });

  $.url = oldJQueryUrl;
  Popup.tabUrl = null;
});

test('.getPagePath returns the url path of the current page', function() {
  var protocol = 'http';
  var host = 'www.somesite.com';
  var directory = '/foo/bar/';
  var url = protocol + '://' + host + directory + 'somePage.html';
  var oldJQueryUrl = $.url;
  Popup.tabUrl = url;

  jack(function() {
    var urlObj = jack.create('urlObj', ['setUrl', 'attr']);
    $.url = urlObj;

    jack.expect('urlObj.setUrl')
      .withArguments(url)
      .returnValue(urlObj);
    jack.expect('urlObj.attr')
      .withArguments('directory')
      .returnValue(directory);

    equals(directory, Popup.getPagePath());
  });
  
  $.url = oldJQueryUrl;
  Popup.tabUrl = null;
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

test('.getScriptBodyCallback runs jslint on the provided script body and renders the result', function() {
  var source = 'this is the script source';
  var result = new Object();

  jack(function() {
    jack.expect('JSLINT')
      .withArguments(source)
      .returnValue(result);
    jack.expect('Popup.renderJSLintResults')
      .mock(noop)
      .withArguments(result);

    Popup.getScriptBodyCallback(source);
  });
});
