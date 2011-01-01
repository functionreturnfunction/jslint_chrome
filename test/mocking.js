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
