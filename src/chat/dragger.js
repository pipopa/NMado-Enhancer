const initDragger = (youtubeId) => {
  let cssPath = chrome.extension.getURL("style/chat.css");
  let link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", cssPath);
  document.getElementsByTagName("head")[0].appendChild(link);

  let header = document.querySelector("yt-live-chat-header-renderer");

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

};

export {
  initDragger
}
