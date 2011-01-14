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

// test('.getScripts sends a request to the given tab with the "getScripts" action and getScriptsCallback, and sets the tabId and tabUrl', function() {
//   var tab = {
//     id: 1234,
//     url: 'this is the tab url'
//   };

//   jack(function() {
//     jack.expect('chrome.tabs.sendRequest')
//       .mock(function(tabId, request, cb) {
//         equals(tab.id, tabId);
//         equals('getScripts', request.action);
//         same(Popup.getScriptsCallback, cb);
//       });

//     Popup.getScripts(tab);

//     equals(tab.id, Popup.tabId)
//     equals(tab.url, Popup.tabUrl);
//   });
// });

// test('.getScriptsCallback calls .renderScriptUrls with the scripts attribute of the response object mapped to objects with a url property, fixing relative urls along the way, then shows the scripts_loaded controls', function() {
//   var scripts = ['foo', 'bar'];
//   var altered = ['fooAltered', 'barAltered']
//   var response = {
//     scripts: scripts
//   };
//   var i = 0;

//   jack(function() {
//     var scriptsLoaded = jack.create('scriptsLoaded', ['show']);
//     var noScriptsLoaded = jack.create('noScriptsLoaded', ['hide']);

//     jack.expect('$')
//       .withArguments(Popup.SCRIPTS_LOADED)
//       .returnValue(scriptsLoaded);
//     jack.expect('scriptsLoaded.show');
//     jack.expect('$')
//       .withArguments(Popup.NO_SCRIPTS_LOADED)
//       .returnValue(noScriptsLoaded);
//     jack.expect('noScriptsLoaded.hide');
//     jack.expect('Popup.fixRelativeUrl')
//       .exactly(scripts.length + ' times')
//       .mock(function(item) {
//         equals(scripts[i], item);
//         return altered[i++];
//       });
//     jack.expect('Popup.renderScriptUrls')
//       .mock(function(items) {
//         equals(items[0].url, altered[0]);
//         equals(items[1].url, altered[1]);
//       });

//     Popup.getScriptsCallback(response);
//   });
// });

// test('.renderScriptUrls renders given url objects using the script url template into script controls and wires the event handler for them', function() {
//   var scripts = new Object();

//   jack(function() {
//     var template = jack.create('template', ['tmpl', 'appendTo']);
//     var scriptUrls = jack.create('scriptUrls', ['click']);

//     jack.expect('$')
//       .withArguments(Popup.TMPL_SCRIPT_URLS)
//       .returnValue(template);
//     jack.expect('template.tmpl')
//       .withArguments(scripts)
//       .returnValue(template);
//     jack.expect('template.appendTo')
//       .withArguments(Popup.DIV_SCRIPTS);
//     jack.expect('$')
//       .withArguments(Popup.BTN_JSLINT)
//       .returnValue(scriptUrls);
//     jack.expect('scriptUrls.click')
//       .withArguments(Popup.btnJSLint_Click);
    
//     Popup.renderScriptUrls(scripts);
//   });
// });

// test('.btnJSLint_Click makes an ajax request to the chosen script url using Popup.getScriptBodyCallback', function() {
//   var url = 'this is the chosen script url';

//   jack(function() {
//     var scriptUrl = jack.create('scriptUrl', ['text']);

//     jack.expect('$')
//       .withArguments(scriptUrl)
//       .returnValue(scriptUrl);
//     jack.expect('scriptUrl.text')
//       .returnValue(url);
//     jack.expect('$.ajax')
//       .mock(function (opts) {
//         equals(url, opts.url);
//         equals('GET', opts.type);
//         equals('text', opts.dataType);
//         equals(Popup.getScriptBodyCallback, opts.success);
//       });

//     Popup.btnJSLint_Click.call(scriptUrl);
//   });
// });

// test('.renderJSLintResults does nothing if result is true, indicating that the script passed JSLint', function() {
//   jack(function() {
//     jack.expect('$')
//       .never();

//     Popup.renderJSLintResults(true);
//   });
// });

// test('.renderJSLintResults formats and appends each error to the output area if result is false, indicating that the script failed JSLint', function() {
//   JSLINT.errors = new Object();

//   jack(function() {
//     var resultsDiv = jack.create('resultsDiv', ['show', 'html']);
//     var template = jack.create('template', ['tmpl', 'appendTo'])

//     jack.expect('$')
//       .mock(noop)
//       .withArguments(Popup.DIV_RESULTS)
//       .returnValue(resultsDiv);
//     jack.expect('resultsDiv.html')
//       .withArguments('<h2>Results:</h2>')
//       .returnValue(resultsDiv);
//     jack.expect('resultsDiv.show')
//       .returnValue(resultsDiv);
//     jack.expect('$')
//       .withArguments(Popup.TMPL_JSLINT_ERROR)
//       .returnValue(template);
//     jack.expect('Popup.cleanupJSLintResults')
//       .mock(noop)
//       .withArguments(JSLINT.errors)
//       .returnValue(JSLINT.errors);
//     jack.expect('template.tmpl')
//       .withArguments(JSLINT.errors)
//       .returnValue(template);
//     jack.expect('template.appendTo')
//       .withArguments(resultsDiv);

//     Popup.renderJSLintResults(false);
//   });

//   JSLINT.errors = null;
// });

// test('.fixRelativeUrl determines and returns the fully-qualified path for the given url', function() {
//   // relative from root
//   var relativeUrl = '/path/to/someScript.js';
//   var baseUrl = 'http://www.somesite.com';
//   var expected = baseUrl + relativeUrl;

//   jack(function() {
//     jack.expect('Popup.getBaseUrl')
//       .mock(noop)
//       .returnValue(baseUrl);

//     equals(expected, Popup.fixRelativeUrl(relativeUrl));
//   });

//   // relative from root
//   var oldJQueryUrl = $.url;
//   var tabUrl = 'http://www.someothersite.com';
//   relativeUrl = '//path/to/otherScript.js';
//   expected = baseUrl + relativeUrl;
//   Popup.tabUrl = tabUrl;

//   jack(function() {
//     $.url = jack.create('urlObj', ['setUrl', 'attr']);

//     jack.expect('urlObj.setUrl')
//       .withArguments(tabUrl)
//       .returnValue($.url);
//     jack.expect('urlObj.attr')
//       .withArguments('protocol')
//       .returnValue('http');

//     equals('http:' + relativeUrl, Popup.fixRelativeUrl(relativeUrl));
//   });

//   $.url = oldJQueryUrl;
//   Popup.tabUrl = null;

//   // not relative, explicit
//   relativeUrl = 'http://www.somesite.com/someScript.js';
//   expected = relativeUrl;

//   jack(function() {
//     jack.expect('Popup.getBaseUrl')
//       .never();

//     equals(expected, Popup.fixRelativeUrl(relativeUrl));
//   });

//   // relative using special chars
//   var pagePath = '/theApp/someModule/';
//   relativeUrl = '../../scripts/someScript.js';
//   expected = baseUrl + pagePath + relativeUrl;

//   jack(function() {
//     jack.expect('Popup.getBaseUrl')
//       .mock(noop)
//       .returnValue(baseUrl);
//     jack.expect('Popup.getPagePath')
//       .mock(noop)
//       .returnValue(pagePath);

//     equals(expected, Popup.fixRelativeUrl(relativeUrl));
//   });

//   // relative from current page path
//   relativeUrl = 'someScript.js';
//   expected = baseUrl + pagePath + relativeUrl;

//   jack(function() {
//     jack.expect('Popup.getBaseUrl')
//       .mock(noop)
//       .returnValue(baseUrl);
//     jack.expect('Popup.getPagePath')
//       .mock(noop)
//       .returnValue(pagePath);

//     equals(expected, Popup.fixRelativeUrl(relativeUrl));
//   });
// });

// test('.getBaseUrl returns the tab url with the page stripped off the end', function() {
//   var protocol = 'http';
//   var host = 'www.somesite.com';
//   var url = protocol + '://' + host + '/somePage.html';
//   var oldJQueryUrl = $.url;
//   Popup.tabUrl = url;

//   jack(function() {
//     var urlObj = jack.create('urlObj', ['setUrl', 'attr']);
//     $.url = urlObj;

//     jack.expect('urlObj.setUrl')
//       .withArguments(url)
//       .returnValue(urlObj);
//     jack.expect('urlObj.attr')
//       .withArguments('protocol')
//       .returnValue(protocol);
//     jack.expect('urlObj.attr')
//       .withArguments('host')
//       .returnValue(host);

//     equals(protocol + '://' + host, Popup.getBaseUrl());
//   });

//   $.url = oldJQueryUrl;
//   Popup.tabUrl = null;
// });

// test('.getBaseUrl does not include host if null', function() {
//   var protocol = 'file';
//   var host = null;
//   var url = protocol + ':///somePage.html';
//   var oldJQueryUrl = $.url;
//   Popup.tabUrl = url;

//   jack(function() {
//     var urlObj = jack.create('urlObj', ['setUrl', 'attr']);
//     $.url = urlObj;

//     jack.expect('urlObj.setUrl')
//       .withArguments(url)
//       .returnValue(urlObj);
//     jack.expect('urlObj.attr')
//       .withArguments('protocol')
//       .returnValue(protocol);
//     jack.expect('urlObj.attr')
//       .withArguments('host')
//       .returnValue(host);

//     equals(protocol + '://', Popup.getBaseUrl());
//   });

//   $.url = oldJQueryUrl;
//   Popup.tabUrl = null;
// });

// test('.getPagePath returns the url path of the current page', function() {
//   var protocol = 'http';
//   var host = 'www.somesite.com';
//   var directory = '/foo/bar/';
//   var url = protocol + '://' + host + directory + 'somePage.html';
//   var oldJQueryUrl = $.url;
//   Popup.tabUrl = url;

//   jack(function() {
//     $.url = jack.create('urlObj', ['setUrl', 'attr']);

//     jack.expect('urlObj.setUrl')
//       .withArguments(url)
//       .returnValue($.url);
//     jack.expect('urlObj.attr')
//       .withArguments('directory')
//       .returnValue(directory);

//     equals(directory, Popup.getPagePath());
//   });
  
//   $.url = oldJQueryUrl;
//   Popup.tabUrl = null;
// });

// test('.htmlEncode html encodes the given string', function() {
//   var str = '<<..>>asdf>fdsa<';
//   var expected = '&lt;&lt;..&gt;&gt;asdf&gt;fdsa&lt;'

//   equals(expected, Popup.htmlEncode(str));
// });

// test('.btnCancel_Click() closes the window', function() {
//   jack(function() {
//     jack.expect('window.close')
//       .mock(noop);

//     Popup.btnCancel_Click();
//   });
// });

// test('.getScriptBodyCallback runs jslint on the provided script body and renders the result', function() {
//   var source = 'this is the script source';
//   var result = new Object();

//   jack(function() {
//     jack.expect('JSLINT')
//       .withArguments(source)
//       .returnValue(result);
//     jack.expect('Popup.renderJSLintResults')
//       .mock(noop)
//       .withArguments(result);

//     Popup.getScriptBodyCallback(source);
//   });
// });

// test('.cleanupJSLintResults removes any null items and html encodes the "evidence" values', function() {
//   var evidence = 'this is unencoded evidence';
//   var encodedEvidence = 'this is encoded evidence';
//   var errors = [
//     {evidence: evidence},
//     {evidence: evidence},
//     {evidence: evidence},
//     {}, // last one may have no evidence
//     null // will have nulls for some reason
//   ];

//   jack(function() {
//     jack.expect('Popup.htmlEncode')
//       .mock(noop)
//       .exactly((errors.length - 2) + ' times')
//       .withArguments(evidence)
//       .returnValue(encodedEvidence);

//     var result = Popup.cleanupJSLintResults(errors);
//     equals(errors.length - 1, result.length);
//     $.each(result, function(i, item) {
//       equals(i < (errors.length - 2) ? encodedEvidence : '<none>',
//              item.evidence);
//     });
//   });
// });
