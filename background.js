const storageKey = 'nameList';

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
};

const setStorageData = (key, value) => {
  return new Promise(resolve => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      () => {
        resolve();
      },
    );
  });
};

const isMac = () => {
  return new Promise(resolve => {
    chrome.runtime.getPlatformInfo(info => resolve(info.os === 'mac'));
  });
};

const execNotification = async request => {
  const { liveTitle, authorName, message, iconUrl, ownerName, ownerIconUrl } = request;
  const option = {
    type: 'basic',
    title: authorName,
    message,
    contextMessage: liveTitle,
    iconUrl,
    buttons: [
      (await isMac())
        ? {
            // Macのときは長すぎるメッセージを表示するためにボタンを使う
            title: message,
          }
        : {
            // Windowsのときは通知元のチャンネル情報を表示するためにボタンを使う
            title: ownerName,
            iconUrl: ownerIconUrl,
          },
    ],
  };

  chrome.notifications.create(option, () => {});
};

chrome.runtime.onInstalled.addListener(async () => {
  const storageData = await getStorageData(storageKey);

  if (Object.keys(storageData).length === 0) {
    await setStorageData(storageKey, []);
  }
});

chrome.runtime.onMessage.addListener(message => {
  console.log(message);
  const { id, data } = message;
  if (id === "comment") {
    execNotification(data);
    return;
  }
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
