/*!
 * vtuber-comment-extension v0.9 (https://github.com/clngn/vtuber-comment-extension)
 * Copyright (c) 2018 clngn
 * Licensed under MIT (https://github.com/jgthms/bulma/blob/master/LICENSE)
 */

const storageKey = "nameList";

const getBrowser = () => {
  if (typeof chrome !== "undefined") {
    if (typeof browser !== "undefined") {
      return "Firefox";
    } else {
      return "Chrome";
    }
  } else {
    return "Edge";
  }
}

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

const fetchBlobUrl = async (url) => {
  const resp = await fetch(url);
  const blob = await resp.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  return blobUrl;
}

const execNotification = async request => {
  const { liveTitle, authorName, message, iconUrl, ownerName, ownerIconUrl } = request;
  let title = authorName;
  let option = {
    type: 'basic',
    message,
    iconUrl: await fetchBlobUrl(iconUrl)
  };
  if (getBrowser() === "Firefox") {
    // チャット送信者のあとに配信タイトルをつける
    title += " from " + liveTitle
    Object.assign(option, {
      title,
    })
  } else {
    Object.assign(option, {
      title,
      contextMessage: liveTitle,
      buttons: [
        (await isMac())
        ? {
          // Macのときは長すぎるメッセージを表示するためにボタンを使う
          title: message,
        }
        : {
          // Windowsのときは通知元のチャンネル情報を表示するためにボタンを使う
          title: ownerName,
          iconUrl: await fetchBlobUrl(ownerIconUrl),
        },
      ],
    })
  }
  console.log(option);

  chrome.notifications.create(option, () => {});
};

chrome.runtime.onInstalled.addListener(async () => {
  const storageData = await getStorageData(storageKey);

  if (Object.keys(storageData).length === 0) {
    await setStorageData(storageKey, []);
  }
});

chrome.runtime.onMessage.addListener(message => {
  const { id, data } = message;
  console.log(id);
  if (id === "comment") {
    execNotification(data);
    return;
  }
  switch (id) {
    case "request-player-loading-status":
    case "request-channel-icon":
    case "request-live-title":
    case "request-owner-name":
    case "player-loaded":
    case "channel-icon":
    case "live-title":
    case "owner-name":
      chrome.tabs.query(
        { url: "https://piporoid.net/NMado/*" }, tabs => {
          for (tab of tabs) {
            chrome.tabs.sendMessage(tab.id, {
              id: id,
              data: data
            });
          }
        }
      );
      break;
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
