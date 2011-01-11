var Utilities = {

  getBaseUrl: function(url) {
    with ($.url.setUrl(url)) {
      return attr('protocol') + '://' + (attr('host') || '');
    }
  },

  getPagePath: function(url) {
    return $.url.setUrl(tabUrl).attr('directory');
  },


  fixRelativeUrl: function(relativeUrl, tabUrl) {
    var baseUrl = getBaseUrl(tabUrl);
    var pagePath = getPagePath(tabUrl);

    switch (true) {
      case /^https?:\/\//.test(relativeUrl):
        return relativeUrl;
      case /^\/\//.test(relativeUrl):
        return $.url.setUrl(tabUrl).attr('protocol') + ':' + relativeUrl;
      case /^\//.test(relativeUrl):
        return baseUrl + relativeUrl;
      default:
        return baseUrl + pagePath + relativeUrl;
    }
  },

  htmlEncode: function(str) {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  cleanupJSLintResults: function(results) {
    var ret = [];
    $.each(results, function(i, item) {
      if (item !== null) {
        item.evidence = item.hasOwnProperty('evidence') ?
          Utilities.htmlEncode(item.evidence) : '<none>';
        ret.push(item);
      }
    });
    return ret;
  }

}