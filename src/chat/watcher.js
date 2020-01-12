const storageKey = 'nameList';

const getStorageData = (key) => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
}

const selector = {
  getChatDom: () => document.querySelector('yt-live-chat-app'),
};

class Watcher {
  constructor(nameList) {
    this.liveTitle = "";
    this.ownerName = "";
    this.ownerIconUrl = "";
    this.nameList = nameList;
  }

  setLiveTitle(liveTitle) {
    this.liveTitle = liveTitle;
  }

  setOwnerName(ownerName) {
    this.ownerName = ownerName;
  }

  setOwnerIconUrl(ownerIconUrl) {
    this.ownerIconUrl = ownerIconUrl;
  }

  getLiveTitle() {
    return this.liveTitle;
  }

  getOwnerName() {
    return this.ownerName;
  }

  getOwnerIconUrl() {
    return this.ownerIconUrl;
  }

  async fetchBlobUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  }

  getMessage(el) {
    let messageString = '';

    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        messageString += child.wholeText;
      }
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.nodeName.toLowerCase() === 'img' && typeof child.alt === 'string') {
          messageString += child.alt;
        }
      }
    }
    return messageString;
  }

  async checkComment(node) {
    if (node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer') {
      return;
    }

    const authorName = node.querySelector('#author-name').textContent;
    console.log(authorName);
    console.log(this.nameList);
    if (this.nameList.some(value => value === authorName.trim())) {
      console.log("hit!");
      const message = this.getMessage(node.querySelector('#message'));
      const iconUrl = node.querySelector('#img').getAttribute('src');
      const iconLargeUrl = iconUrl.replace(/\/photo.jpg$/, '');
      const liveTitle = this.liveTitle;
      const ownerName = this.ownerName;
      const ownerIconUrl = this.ownerIconUrl;
      console.log("hi");
      const data = {
        liveTitle,
        authorName,
        message,
        iconUrl: await this.fetchBlobUrl(iconLargeUrl),
        ownerName,
        ownerIconUrl: await this.fetchBlobUrl(ownerIconUrl),
      };

      console.log(data);
      console.log("send!!!!")
      console.log(chrome.runtime.sendMessage)
      chrome.runtime.sendMessage(
        {
          id: "comment",
          data: data
        }
      );
    }
  }
}

const initWatcher = async (youtubeId) => {
  chrome.runtime.sendMessage({
    id: "request-live-title",
    data: { youtubeId: youtubeId }
  });
  chrome.runtime.sendMessage({
    id: "request-owner-name",
    data: { youtubeId: youtubeId }
  });
  const storageData = await getStorageData(storageKey);
  let nameList = storageData[storageKey];

  let watcher = new Watcher(nameList);

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => watcher.checkComment(node));
    });
  });

  observer.observe(selector.getChatDom(), {
    childList: true,
    subtree: true,
  });
  return watcher;
};

export {
  initWatcher,
  Watcher
}
