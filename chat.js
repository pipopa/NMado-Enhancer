playerLoaded = false
const re = /https:\/\/www.youtube\.com\/live_chat\?.*v=(.+)&/;
const youtubeId = re.exec(location.href)[1];
let liveTitle = "";
let ownerName = "";
let ownerIconUrl = "";
const storageKey = 'nameList';

const selectorList = {
  youtube: {
    getChatDom: () => document.querySelector('yt-live-chat-app'),
    getLiveTitle: () => "title",
    getOwnerName: () => "owner",
    getOwnerIconUrl: () => "https://yt3.ggpht.com/-QRrKvx4b4b4/AAAAAAAAAAI/AAAAAAAAAAA/TqRT-l0Vz-E/s68-c-k-no-mo-rj-c0xffffff/photo.jpg",
  },
  youtubeGaming: {
    getChatDom: () => document.querySelector('yt-live-chat-renderer'),
    getLiveTitle: () => parent.document.querySelector('#details #title .ytg-formatted-string').textContent,
    getOwnerName: () => parent.document.querySelector('#owner > span').textContent,
    getOwnerIconUrl: () =>
    parent.document.querySelector('#details #image').style.backgroundImage.replace(/url\(("|')(.+)("|')\)/gi, '$2'),
  },
};

const selector = window.location.host.match(/gaming/) ? selectorList.youtubeGaming : selectorList.youtube;

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
};

const fetchBlobUrl = async url => {
  const response = await fetch(url);
  const blob = await response.blob();
  return window.URL.createObjectURL(blob);
};

const getMessage = el => {
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
};

const checkComment = async node => {
  if (node.nodeName.toLowerCase() !== 'yt-live-chat-text-message-renderer') {
    return;
  }

  const authorName = node.querySelector('#author-name').textContent;
  if (nameList.some(value => value === authorName.trim())) {
    const message = getMessage(node.querySelector('#message'));
    const iconUrl = node.querySelector('#img').getAttribute('src');
    const iconLargeUrl = iconUrl.replace(/\/photo.jpg$/, '');
    const data = {
      liveTitle,
      authorName,
      message,
      iconUrl: await fetchBlobUrl(iconLargeUrl),
      ownerName,
      ownerIconUrl: await fetchBlobUrl(ownerIconUrl),
    };

    chrome.runtime.sendMessage(
      {
        id: "comment",
        data: data
      },
      () => {},
    );
  }
};

const initChatWatcher = async () => {
  chrome.runtime.sendMessage({
    id: "request-live-title",
    data: { youtubeId: youtubeId }
  });
  chrome.runtime.sendMessage({
    id: "request-owner-name",
    data: { youtubeId: youtubeId }
  });
  const storageData = await getStorageData(storageKey);
  nameList = storageData[storageKey];

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => checkComment(node));
    });
  });

  observer.observe(selector.getChatDom(), {
    childList: true,
    subtree: true,
  });
};


const loaded = () => {
  const checkTimer = setInterval(check, 1000);
  function check () {
    if (document.querySelector("yt-live-chat-header-renderer") === null &&
      document.querySelector("div#page") === null &&
      playerLoaded
    ) {
      chrome.runtime.sendMessage({id: "request-player-loading-status", data: {youtubeId: youtubeId}})
      return
    }
    clearInterval(checkTimer);
    initChatWatcher();
    main();
  }
}
const main = () => {
  // N窓以外では動作させない
  if (!document.referrer.match(/^https:\/\/piporoid.net\/NMado\//)) {
    return;
  }

let cssPath = chrome.extension.getURL("chat.css");
let link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", cssPath);
document.getElementsByTagName("head")[0].appendChild(link);

let header = document.querySelector("yt-live-chat-header-renderer");

chrome.runtime.sendMessage({
  id: "request-channel-icon",
  data: { youtubeId: youtubeId }
});

// 閉じるボタンを追加
let closeButton = document.createElement("div");
closeButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    id: "yt-close",
    data: { winType: "chat", youtubeId: youtubeId }
  });
});
if (header) {
  closeButton.classList.add("close");
  header.appendChild(closeButton);
} else {
  closeButton.classList.add("close-invalid-chat");
  document.querySelector("div#page").appendChild(closeButton);
}

// リサイズハンドルを追加
let resizeHandle = document.createElement("span");
resizeHandle.classList.add("resize-handle");
resizeHandle.style.display = "none";
resizeHandle.addEventListener("mousedown", e => {
  e.preventDefault();
  if (e.which === 1) {
    chrome.runtime.sendMessage({
      id: "yt-mousedown",
      data: {
        winType: "chat",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which,
        action: "resize"
      }
    });
  }
});
resizeHandle.addEventListener("mouseover", () => {});
resizeHandle.addEventListener("mouseup", (e) => {
  chrome.runtime.sendMessage({
    id: "yt-mouseup",
    data: {
      winType: "chat",
      youtubeId: youtubeId,
      pageX: e.pageX,
      pageY: e.pageY,
      which: e.which
    }
  });
});
document.querySelector("div.yt-live-chat-app").appendChild(resizeHandle);

header.addEventListener("mousedown", e => {
  if (e.which !== 1) {
    return;
  }
  if (
    e.target.tagName === "YT-LIVE-CHAT-HEADER-RENDERER" ||
    e.target.classList.contains("channel-icon") ||
    (e.target.tagName !== "YT-ICON" &&
      e.target.classList.contains("yt-live-chat-header-renderer"))
  ) {
    chrome.runtime.sendMessage({
      id: "yt-mousedown",
      data: {
        winType: "chat",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which,
        action: "move"
      }
    });
  }
});
document.querySelector("div#input-panel").addEventListener("mousedown", e => {
  if (e.which !== 1) {
    return;
  }
  if (
    e.target.classList.contains("yt-live-chat-renderer") ||
    e.target.classList.contains("yt-live-chat-message-input-renderer") ||
    e.target.classList.contains("yt-live-chat-author-chip") ||
    e.target.classList.contains("yt-img-shadow")
  ) {
    chrome.runtime.sendMessage({
      id: "yt-mousedown",
      data: {
        winType: "chat",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which,
        action: "move"
      }
    });
  }
})
document.onmousemove = e => {
  e.preventDefault();
  resizeHandle.style.display = "block";
  chrome.runtime.sendMessage({
    id: "yt-mousemove",
    data: {
      winType: "chat",
      youtubeId: youtubeId,
      pageX: e.pageX,
      pageY: e.pageY
    }
  });
};
document.documentElement.addEventListener("mousedown", e => {
  if (e.which == 2) {
    e.preventDefault()
    chrome.runtime.sendMessage({
      id: "yt-mousedown",
      data: {
        winType: "chat",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which
      }
    });
  }
});
document.addEventListener("mouseup", e => {
  chrome.runtime.sendMessage({
    id: "yt-mouseup",
    data: {
      winType: "chat",
      youtubeId: youtubeId,
      pageX: e.pageX,
      pageY: e.pageY,
      which: e.which
    }
  });
});

chrome.runtime.onMessage.addListener(message => {
  const { id, data } = message;
  switch (id) {
    case "player-loaded":
      if (data.youtubeId === youtubeId) {
        playerLoaded = true;
      }
    case "nmado-mouseup":
      //header.style.pointerEvents = "auto"
      break;
    case "yt-mousedown":
      //header.style.pointerEvents = "none"
      break;
    case "yt-mouseup":
      //header.style.pointerEvents = "auto"
      break;
    case "channel-icon":
      if (data.youtubeId === youtubeId) {
        const icon = document.createElement("div");
        icon.classList.add("channel-icon")
        icon.style.backgroundImage = "url(\"" + data.url + "\")";
        const ytpButton = document.querySelector("yt-icon-button#overflow")
        header.insertBefore(icon, ytpButton)
        ownerIconUrl = data.url
      }
      break;
    case "live-title":
      if (data.youtubeId === youtubeId) {
        liveTitle = data.liveTitle
      }
      break;
    case "owner-name":
      if (data.youtubeId === youtubeId) {
        ownerName = data.ownerName
      }
      break;
    case "channel-icon":
      if (data.youtubeId === youtubeId) {
        ownerIconUrl = data.url
      }
      break;
  }
});
};

window.addEventListener("load", loaded, false);

