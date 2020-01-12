loaded = false;
window.addEventListener("load", onLoad, false);

function onLoad () {
  const checkTimer = setInterval(check, 1000);
  function check () {
    if (document.querySelector("div.html5-video-player") === null) {
      return
    }
    loaded = true;
    clearInterval(checkTimer);
    main();
  }
}

function main () {
  // N窓以外では動作させない
  if (!document.referrer.match(/^https:\/\/piporoid.net\/NMado\//)) {
    return;
  }

  let cssPath = chrome.extension.getURL("player.css");
  let link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", cssPath);
  document.getElementsByTagName("head")[0].appendChild(link);

  const re = /https:\/\/www.youtube.com\/embed\/(.+)\?/;
  const youtubeId = re.exec(location.href)[1];
  let player = document.querySelector("div#player");
  let html5player = document.querySelector("div.html5-video-player");
  let video = document.querySelector("video");
  let dragging = false;
  let timer;

  const hide = () => {
    document.querySelector("div.ytp-chrome-top").style.opacity = "0.0";
    document.querySelector("div.ytp-chrome-top").style["pointer-events"] =
      "none";
    document.querySelector("div.ytp-chrome-bottom").style.display = "none";
    document.querySelector("div.ytp-gradient-top").style.display = "none";
    document.querySelector("div.ytp-gradient-bottom").style.display = "none";
  };

  const show = () => {
    document.querySelector("div.ytp-chrome-top").style.opacity = "1.0";
    document.querySelector("div.ytp-chrome-top").style["pointer-events"] =
      "auto";
    document.querySelector("div.ytp-chrome-bottom").style.display = "block";
    document.querySelector("div.ytp-gradient-top").style.display = "inline";
    document.querySelector("div.ytp-gradient-bottom").style.display = "inline";
  };

  // 閉じるボタンを追加
  let closeButton = document.createElement("div");
  closeButton.classList.add("close");
  closeButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      id: "yt-close",
      data: { winType: "video", youtubeId: youtubeId }
    });
  });
  html5player.appendChild(closeButton);

  // チャット表示ボタンを追加
  let chatButton = document.createElement("button");
  chatButton.classList.add("ytp-button");
  chatButton.innerHTML =
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 36 36" width="36" height="36"><defs><path d="M26.43 10.15L26.63 10.21L26.82 10.28L27.01 10.38L27.18 10.49L27.34 10.62L27.48 10.77L27.61 10.92L27.73 11.1L27.82 11.28L27.9 11.47L27.95 11.68L27.99 11.89L28 12.1L28 24.1L27.99 24.32L27.95 24.53L27.9 24.73L27.82 24.93L27.73 25.11L27.61 25.28L27.48 25.44L27.34 25.59L27.18 25.72L27.01 25.83L26.82 25.93L26.63 26L26.43 26.06L26.22 26.09L26 26.1L12 26.1L8 30.1L8.01 12.1L8.02 11.89L8.06 11.68L8.11 11.47L8.19 11.28L8.28 11.1L8.39 10.92L8.52 10.77L8.67 10.62L8.82 10.49L9 10.38L9.18 10.28L9.37 10.21L9.57 10.15L9.78 10.12L10 10.1L26 10.1L26.22 10.12L26.43 10.15ZM12 22.1L20 22.1L20 20.1L12 20.1L12 22.1ZM12 19.1L24 19.1L24 17.1L12 17.1L12 19.1ZM12 16.1L24 16.1L24 14.1L12 14.1L12 16.1Z" id="b6uPfTWHcM"></path></defs><g><g><g><use xlink:href="#b6uPfTWHcM" opacity="1" fill="white" fill-opacity="1"></use><g><use xlink:href="#b6uPfTWHcM" opacity="1" fill-opacity="0" stroke="#000000" stroke-width="1" stroke-opacity="0"></use></g></g></g></g></svg>';
  chatButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      id: "yt-click-showchat",
      data: { winType: "video", youtubeId: youtubeId }
    });
  });
  let parent = document.querySelector("div.ytp-right-controls");
  let reference = document.querySelector("button.ytp-subtitles-button");
  parent.insertBefore(chatButton, reference);

  // リサイズハンドルを追加
  let resizeHandle = document.createElement("span");
  resizeHandle.classList.add("resize-handle");
  resizeHandle.style.display = "none";
  resizeHandle.addEventListener("mousedown", e => {
    e.preventDefault();
    hide();
    chrome.runtime.sendMessage({
      id: "yt-mousedown",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which,
        action: "resize"
      }
    });
  });
  resizeHandle.addEventListener("mouseup", e => {
    if (e.which == 1) {
      closeButton.style.display = "block";
    }
    chrome.runtime.sendMessage({
      id: "yt-mouseup",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which
      }
    });
  });
  player.appendChild(resizeHandle);

  document.addEventListener("mousemove", (e) => {
    chrome.runtime.sendMessage({
      id: "yt-mousemove",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY
      }
    });
  })
  document.addEventListener("mouseup", (e) => {
    if (e.which == 1) {
      closeButton.style.display = "block";
    }
    chrome.runtime.sendMessage({
      id: "yt-mouseup",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which
      }
    });
  })


  video.onclick = e => {
    e.stopPropagation();
  };
  video.ondblclick = e => {
    e.stopPropagation();
  };
  video.onmousedown = e => {
    e.preventDefault();
    if (e.which !== 1 && e.which !== 2) {
      return;
    }
    hide();
    closeButton.style.display = "none";
    resizeHandle.style.display = "none";
    chrome.runtime.sendMessage({
      id: "yt-mousedown",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which,
        action: "move"
      }
    });
  };
  video.onmouseup = e => {
    if (e.which == 1) {
      show();
      closeButton.style.display = "block";
      resizeHandle.style.display = "block";
      clearTimeout(timer);
      timer = setTimeout(() => {
        closeButton.style.display = "none";
        resizeHandle.style.display = "none";
        hide();
        html5player.style.cursor = "none";
      }, 2000);
      chrome.runtime.sendMessage({
        id: "yt-mouseup",
        data: {
          winType: "video",
          youtubeId: youtubeId,
          pageX: e.pageX,
          pageY: e.pageY,
          which: e.which
        }
      });
    }
  };

player.addEventListener("mousedown", e => {
  if (e.which !== 1 && e.which !== 2) {
    return;
  }
  if (e.targettagName === "video" || e.target.classList.contains("ytp-offline-slate")) {
    hide();
    closeButton.style.display = "none";
    resizeHandle.style.display = "none";
    chrome.runtime.sendMessage({
      id: "yt-mousedown",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which,
        action: "move"
      }
    });
  }
})
player.addEventListener("mouseup", e => {
  if (e.which == 1) {
    show();
    closeButton.style.display = "block";
    resizeHandle.style.display = "block";
    clearTimeout(timer);
    timer = setTimeout(() => {
      closeButton.style.display = "none";
      resizeHandle.style.display = "none";
      hide();
      html5player.style.cursor = "none";
    }, 2000);
    chrome.runtime.sendMessage({
      id: "yt-mouseup",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY,
        which: e.which
      }
    });
  }
})
  player.onmousemove = () => {
    if (!dragging) {
      show();
      closeButton.style.display = "block";
      resizeHandle.style.display = "block";
      html5player.style.cursor = "move";
      clearTimeout(timer);
      timer = setTimeout(() => {
        closeButton.style.display = "none";
        resizeHandle.style.display = "none";
        hide();
        html5player.style.cursor = "none";
      }, 2000);
    }
  };
  player.onmouseover = () => {
    if (!dragging) {
      show();
      resizeHandle.style.display = "block";
      closeButton.style.display = "block";
      clearTimeout(timer);
      timer = setTimeout(() => {
        closeButton.style.display = "none";
        resizeHandle.style.display = "none";
        hide();
        html5player.style.cursor = "none";
      }, 2000);
    }
  };
  player.onmouseout = () => {
    hide();
    closeButton.style.display = "none";
    resizeHandle.style.display = "none";
    clearTimeout(timer);
    if (!dragging) {
      closeButton.style.display = "none";
      resizeHandle.style.display = "none";
    }
  };

  chrome.runtime.onMessage.addListener(message => {
    const { id, data } = message;
    switch (id) {
      case "nmado-mouseup":
        show();
        closeButton.style.display = "block";
        resizeHandle.style.display = "block";
        dragging = false;
        clearTimeout(timer);
        timer = setTimeout(() => {
          closeButton.style.display = "none";
          resizeHandle.style.display = "none";
          hide();
          html5player.style.cursor = "none";
        }, 2000);
        break;
      case "yt-mousedown":
        dragging = data.which === 1;
        break;
      case "yt-mouseup":
        dragging = false;
        break;
      case "request-player-loading-status":
        if (data.youtubeId === youtubeId && loaded) {
          chrome.runtime.sendMessage({
            id: "player-loaded",
            data: { youtubeId: youtubeId }
          });
        }
        break;
      case "request-channel-icon":
        if (data.youtubeId === youtubeId) {
          const icon = document.querySelector("a.ytp-title-channel-logo");
          if (icon) {
            const url = icon.style.backgroundImage.slice(5, -2);
            chrome.runtime.sendMessage({
              id: "channel-icon",
              data: { url: url, youtubeId: youtubeId }
            });
          }
        }
        break;
      case "request-live-title":
        if (data.youtubeId === youtubeId) {
          const titleLink = document.querySelector(".ytp-title-link.yt-uix-sessionlink");
          if (titleLink) {
            const liveTitle = titleLink.innerHTML;
            console.log("player: "  + liveTitle)
            chrome.runtime.sendMessage({
              id: "live-title",
              data: { liveTitle: liveTitle, youtubeId: youtubeId }
            });
          }
        }
        break;
      case "request-owner-name":
        if (data.youtubeId === youtubeId) {
          const expandedTitle = document.querySelector(".ytp-title-expanded-title a");
          if (expandedTitle) {
            const ownerName = expandedTitle.innerHTML;
            console.log("player: "  + ownerName)
            chrome.runtime.sendMessage({
              id: "owner-name",
              data: { ownerName: ownerName, youtubeId: youtubeId }
            });
          }
        }
        break;
    }
  });
};
