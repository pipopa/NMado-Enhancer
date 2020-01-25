/*!
 * vtuber-comment-extension v0.9 (https://github.com/clngn/vtuber-comment-extension)
 * Copyright (c) 2018 clngn
 * Licensed under MIT (https://github.com/clngn/vtuber-comment-extension/blob/master/LICENSE)
 */

const nameListKey = 'nameList';
const highlightKey = 'highlight';
const notificationKey = 'notification';

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

// Save Settings
document.querySelector('#save-button').addEventListener('click', async () => {
  const inputData = document.querySelector('#name-list textArea').value;
  const useHighlight = document.querySelector('#use-highlight').classList.contains('is-checked');
  const useNotification = document.querySelector('#use-notification').classList.contains('is-checked');
  await setStorageData(nameListKey, inputData.split('\n'));
  await setStorageData(highlightKey, useHighlight);
  await setStorageData(notificationKey, useNotification);
  document.querySelector('#result-dialog').showModal();
});

// Close Dialog
document.querySelector('#result-dialog .close').addEventListener('click', () => {
  document.querySelector('dialog').close();
});

// Notification Test
document.querySelector('#notification-test-button').addEventListener('click', () => {
  chrome.runtime.sendMessage(
    {
      id: "comment",
      data: {
        liveTitle: "通知テスト",
        authorName: "みんなよう見とる",
        message: "テストだよ",
        iconUrl: chrome.runtime.getURL("icon128.png"),
        ownerName: "テスト",
        ownerIconUrl: chrome.runtime.getURL("icon128.png"),
      }
    },
    () => {},
  );
});

const init = async () => {
  const storageData = await getStorageData([nameListKey, highlightKey, notificationKey]);
  const nameList = storageData[nameListKey];
  const useHighlight = storageData[highlightKey];
  const useNotification = storageData[notificationKey];

  const textArea = document.querySelector('#name-list textArea');
  textArea.value = nameList.join('\n');

  if (useHighlight) {
    const useHighlightCheckBox = document.querySelector('#use-highlight');
    setTimeout(() => { useHighlightCheckBox.MaterialCheckbox.check(); }, 200);
  }

  if (useNotification) {
    const useNotificationCheckBox = document.querySelector('#use-notification');
    setTimeout(() => { useNotificationCheckBox.MaterialCheckbox.check(); }, 200);
  }
};
init();
