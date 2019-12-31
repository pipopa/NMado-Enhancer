dragging = false;
chrome.runtime.onMessage.addListener(message => {
  const { id, data } = message;
  switch (id) {
    default:
      chrome.tabs.query(
        { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
        tabs => {
          const tab = tabs[0];
          chrome.tabs.sendMessage(tab.id, {
            id: id,
            data: data
          });
        }
      );
      break;
  }
});
