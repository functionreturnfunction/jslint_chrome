var chrome = {
  browserAction: {
    onClicked: {
      addListener: noop
    }
  },
  extension: {
    onRequest: {
      addListener: noop
    }
  },
  tabs: {
    sendRequest: noop,
    getSelected: noop
  }
};

var JSLINT = noop;

var $ = noop;

$.each = function(arr, fn) {
  for (var i = 0, len = arr.length; i < len; ++i) {
    fn(i, arr[i]);
  }
};

$.map = function(arr, fn) {
  var ret = [];
  $.each(arr, function(i, item) {
    ret.push(fn(item, i));
  });
  return ret;
}

$.ajax = noop;

$.url = {
  setUrl: noop
};
