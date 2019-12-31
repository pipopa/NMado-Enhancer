window.addEventListener("load", loaded, false);

function loaded () {
  const checkTimer = setInterval(check, 1000);
  function check () {
    if (document.querySelector("yt-live-chat-header-renderer") === null && document.querySelector("yt-live-chat-app") === null) {
      return
    }
    clearInterval(checkTimer)
    main()
  }
}
function main () {
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

  const re = /https:\/\/www.youtube\.com\/live_chat\?.*v=(.+)&/;
  const youtubeId = re.exec(location.href)[1];
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
    document.querySelector("yt-live-chat-app").appendChild(closeButton);
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
  resizeHandle.addEventListener("mouseup", () => {
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
      e.target.tagName !== "YT-ICON" &&
      e.target.tagName !== "YT-ICON-BUTTON" &&
      e.target.id !== "input"
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
      case "nmado-mouseup":
        //header.style.pointerEvents = "auto"
        break;
      case "yt-mousedown":
        //header.style.pointerEvents = "none"
        break;
      case "yt-mouseup":
        //header.style.pointerEvents = "auto"
        break;
    }
  });
};
