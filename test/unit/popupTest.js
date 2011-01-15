loadScriptDynamically('../../src/popup.js');
module('Popup Script');

test('.initialize sets up jquery ajax defaults, sets up the tabs, gets the scripts from the page, and initializes events', function() {
  jack(function() {
    var tabs = jack.create('tabs', ['tabs']);

    jack.expect('$.ajaxSetup')
      .mock(function(args) {
        equals(args.type, 'GET');
        equals(args.dataType, 'text');
        same(args.success, Popup.callbacks.onScriptBodyAjaxCallback)
      });
    jack.expect('$')
      .withArguments(Popup.selectors.tabElement)
      .returnValue(tabs);
    jack.expect('tabs.tabs');
    jack.expect('chrome.tabs.getSelected')
      .withArguments(null, Popup.methods.getPageScripts);
    jack.expect('Popup.initializeEvents')
      .mock(noop);

    Popup.initialize();
  });
});

test('.initializeEvents initializes the click event handlers for the close and script url buttons', function() {
  jack(function() {
    var buttonClose = jack.create('buttonClose', ['click']);
    var scriptUrl = jack.create('scriptUrl', ['live']);

    jack.expect('$')
      .mock(noop)
      .withArguments(Popup.selectors.buttonClose)
      .returnValue(buttonClose);
    jack.expect('buttonClose.click')
      .withArguments(Popup.callbacks.onClosePopup);
    jack.expect('$')
      .mock(noop)
      .withArguments(Popup.selectors.scriptUrl)
      .returnValue(scriptUrl);
    jack.expect('scriptUrl.live')
      .withArguments('click', Popup.callbacks.onScriptClicked);
    
    Popup.initializeEvents();
  });
});

module('Popup.callbacks');

test('.onClosePopup closes the current window', function() {
  jack(function() {
    jack.expect('window.close')
      .mock(noop);

    Popup.callbacks.onClosePopup();
  });
});

test('.onScriptClicked prevents the default event handler and makes an ajax call to the url from the target element', function() {
  jack(function() {
    var event = jack.create('event', ['preventDefault']);
    var scriptUrl = jack.create('scriptUrl', ['attr']);
    var href = 'this is the href';

    jack.expect('event.preventDefault');
    jack.expect('$')
      .withArguments(scriptUrl)
      .returnValue(scriptUrl);
    jack.expect('scriptUrl.attr')
      .withArguments('href')
      .returnValue(href);
    jack.expect('$.ajax')
      .mock(function(args) {
        equals(args.url, href);
      });

    Popup.callbacks.onScriptClicked.call(scriptUrl, event);
  });
});

test('.onPageScriptsCallback', function() {
  var scripts = ['foo', 'bar'];
  var altered = ['fooAltered', 'barAltered']
  var sorted = new Object();
  var response = {
    scripts: scripts
  };
  var i = 0;
  Popup.tab = {url: 'some url'};

  jack(function() {
    jack.expect('Popup.utilities.fixRelativeUrl')
      .exactly(scripts.length + ' times')
      .mock(function(item, url) {
        equals(scripts[i], item);
        equals(url, Popup.tab.url);
        return altered[i++];
      });
    jack.expect('Popup.utilities.sortByHost')
      .mock(function(args) {
        equals(altered[0], args[0].url);
        equals(altered[1], args[1].url);
        return sorted;
      });
    jack.expect('Popup.methods.renderScriptUrls')
      .mock(noop)
      .withArguments(sorted);

    Popup.callbacks.onPageScriptsCallback(response);
  });
});

test('.onScriptBodyAjaxCallback renders the results from calling JSLINT on the given source', function() {
  var source = 'this is the source';
  var results = new Object();

  jack(function() {
    jack.expect('JSLINT')
      .mock(noop)
      .withArguments(source)
      .returnValue(results);
    jack.expect('Popup.methods.renderJSLintResults')
      .mock(noop)
      .withArguments(results);

    Popup.callbacks.onScriptBodyAjaxCallback(source);
  });
});

module('Popup.methods');

test('.getPageScripts sets the popup tab and sends a request to the tab to get the scripts from the page', function() {
  Popup.tab = null;
  var tab = {id: 1234};

  jack(function() {
    jack.expect('chrome.tabs.sendRequest')
      .mock(function(id, args, callback) {
        equals(id, tab.id);
        equals(args.action, 'getScripts');
        same(callback, Popup.callbacks.onPageScriptsCallback);
      });

    Popup.methods.getPageScripts(tab);
  });

  same(Popup.tab, tab);
  Popup.tab = null;
});

test('.renderScriptUrls renders the sorted script urls by host using the script template', function() {
  var sorted = {
    'foo': 'bar'
  };

  jack(function() {
    var scriptList = jack.create('scriptList', ['html']);
    var li = jack.create('li', ['addClass', 'html', 'appendTo']);
    var scriptTemplate = jack.create('scriptTemplate', ['tmpl', 'appendTo']);

    jack.expect('$')
      .withArguments(Popup.selectors.scriptList)
      .returnValue(scriptList);
    jack.expect('scriptList.html')
      .withArguments('')
      .returnValue(scriptList);
    jack.expect('$')
      .withArguments('<li>')
      .returnValue(li);
    jack.expect('li.addClass')
      .withArguments('script_host')
      .returnValue(li);
    jack.expect('li.html')
      .withArguments('foo')
      .returnValue(li)
    jack.expect('li.appendTo')
      .withArguments(scriptList);
    jack.expect('$')
      .withArguments(Popup.selectors.scriptTemplate)
      .returnValue(scriptTemplate);
    jack.expect('scriptTemplate.tmpl')
      .withArguments('bar')
      .returnValue(scriptTemplate);
    jack.expect('scriptTemplate.appendTo')
      .withArguments(scriptList);

    Popup.methods.renderScriptUrls(sorted);
  });
});

test('.renderJSLintResults renders the jslint errors collection and navigates to the results tab', function() {
  var errors = new Object();
  JSLINT.errors = errors;

  jack(function() {
    var resultsTemplate = jack.create('resultsTemplate', ['tmpl', 'appendTo']);
    var tabElement = jack.create('tabElement', ['tabs']);

    jack.expect('$')
      .withArguments(Popup.selectors.resultsTemplate)
      .returnValue(resultsTemplate);
    jack.expect('Popup.utilities.cleanupJSLintResults')
      .withArguments(errors)
      .returnValue(errors);
    jack.expect('resultsTemplate.tmpl')
      .withArguments(errors)
      .returnValue(resultsTemplate);
    jack.expect('resultsTemplate.appendTo')
      .withArguments(Popup.selectors.resultsContainer);
    jack.expect('$')
      .withArguments(Popup.selectors.tabElement)
      .returnValue(tabElement);
    jack.expect('tabElement.tabs')
      .withArguments('navTo', Popup.selectors.resultsTab);

    Popup.methods.renderJSLintResults(false);
  });
});

test('.renderJSLintResults does not render if result is true', function() {
  jack(function() {
    jack.expect('$')
      .never();

    Popup.methods.renderJSLintResults(true);
  });
});

module('Popup.utilities');

test('.sortByHost sorts the given url array by host name, skipping any null urls', function() {
  $ = jQuery;
  var urls = [
    {url: 'http://www.b-site.com'},
    {url: 'http://www.c-site.com/someApp/somePage.html'},
    {url: 'http://www.a-site.com'},
    {url: 'http://www.a-site.com/someApp/somePage.html'},
    {url: null},
    {url: null}
  ];

  var sorted = Popup.utilities.sortByHost(urls);
  equals(sorted['www.a-site.com'][0].url, 'http://www.a-site.com');
  equals(sorted['www.a-site.com'][0].path, '/');
  equals(sorted['www.a-site.com'][1].url, 'http://www.a-site.com/someApp/somePage.html');
  equals(sorted['www.a-site.com'][1].path, '/someApp/somePage.html');
  equals(sorted['www.b-site.com'][0].url, 'http://www.b-site.com');
  equals(sorted['www.b-site.com'][0].path, '/');
  equals(sorted['www.c-site.com'][0].url, 'http://www.c-site.com/someApp/somePage.html');
  equals(sorted['www.c-site.com'][0].path, '/someApp/somePage.html');

  var i = 4;
  for (var x in sorted) {
    for (var j = sorted[x].length - 1; j >= 0; --j) {
      --i;
    }
  }
  equals(0, i);
});

test('.getBaseUrl returns protocol and host from the given url', function() {
  equals('http://www.somesite.com',
         Popup.utilities.getBaseUrl(
           'http://www.somesite.com/asdf/fdsa/someScript.js'));
  equals('https://somesite.com',
         Popup.utilities.getBaseUrl(
           'https://somesite.com/1234/4321/someFile.txt'));
  equals('https://somesite.com',
         Popup.utilities.getBaseUrl(
           'https://somesite.com'));
});

test('.getPagePath gets the directory path from the given url', function() {
  equals('/path/to/',
         Popup.utilities.getPagePath(
           'https://somesite.com/path/to/thePage.html'));
  equals(null, Popup.utilities.getPagePath('https://somesite.com'));
});

test('.fixRelativeUrl determines and returns the fully-qualified path for the given url', function() {
  var tabUrl = 'http://www.somesite.com';
  // relative from root
  var relativeUrl = '/path/to/someScript.js';
  var baseUrl = 'http://www.somesite.com';
  var expected = baseUrl + relativeUrl;

  equals(expected, Popup.utilities.fixRelativeUrl(relativeUrl, tabUrl));

  // relative from root
  relativeUrl = '//path/to/otherScript.js';
  expected = baseUrl + relativeUrl;
  Popup.tabUrl = tabUrl;

  equals('http:' + relativeUrl, Popup.utilities.fixRelativeUrl(relativeUrl, tabUrl));

  // not relative, explicit
  relativeUrl = 'http://www.somesite.com/someScript.js';
  expected = relativeUrl;

  equals(expected, Popup.utilities.fixRelativeUrl(relativeUrl, tabUrl));

  // relative using special chars
  var pagePath = '/theApp/someModule/';
  tabUrl = tabUrl + pagePath;
  relativeUrl = '../../scripts/someScript.js';
  expected = baseUrl + pagePath + relativeUrl;

  equals(expected, Popup.utilities.fixRelativeUrl(relativeUrl, tabUrl));

  // relative from current page path
  relativeUrl = 'someScript.js';
  expected = baseUrl + pagePath + relativeUrl;

  equals(expected, Popup.utilities.fixRelativeUrl(relativeUrl, tabUrl));

  // file url:
  equals(null, Popup.utilities.fixRelativeUrl('file://asdf/fdsa'));

  // chrome-extension url:
  equals(null, Popup.utilities.fixRelativeUrl('chrome-extension://asdf/fdsa', tabUrl));
});

test('.htmlEncode html encodes the given string', function() {
  var str = '<<..>>asdf>fdsa<';
  var expected = '&lt;&lt;..&gt;&gt;asdf&gt;fdsa&lt;'

  equals(expected, Popup.utilities.htmlEncode(str));
});

test('.cleanupJSLintResults removes any null items and html encodes the "evidence" values', function() {
  var evidence = 'this is unencoded evidence';
  var encodedEvidence = 'this is encoded evidence';
  var errors = [
    {evidence: evidence},
    {evidence: evidence},
    {evidence: evidence},
    {}, // last one may have no evidence
    null // will have nulls for some reason
  ];

  jack(function() {
    jack.expect('Popup.utilities.htmlEncode')
      .mock(noop)
      .exactly((errors.length - 2) + ' times')
      .withArguments(evidence)
      .returnValue(encodedEvidence);

    var result = Popup.utilities.cleanupJSLintResults(errors);
    equals(errors.length - 1, result.length);
    $.each(result, function(i, item) {
      equals(i < (errors.length - 2) ? encodedEvidence : '<none>',
             item.evidence);
    });
  });
});
