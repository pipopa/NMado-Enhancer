import { getBrowser } from "./util.js";

const onLoad = () => {
  // N窓以外では動作させない
  if (!document.referrer.match(/^https:\/\/piporoid.net\/NMado\//)) {
    return;
  }

  const checkTimer = setInterval(check, 1000);
  function check() {
    if (document.querySelector("div.html5-video-player") === null) {
      return;
    }
    clearInterval(checkTimer);
    main();
  }
};

const main = () => {
  let cssPath = chrome.extension.getURL("style/player.css");
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

  chrome.runtime.sendMessage({
    id: "player-loaded",
    data: { youtubeId: youtubeId }
  });

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

  let screenShotButton = document.createElement("button");
  screenShotButton.classList.add("ytp-button");
  screenShotButton.innerHTML =
    '<svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" width="36" height="36" style="enable-background:new 0 0 512 512;" xml:space="preserve"> <style type="text/css"> .st0{fill:#4B4B4B;} </style> <g transform="scale(0.65,0.65) translate(110, 115)"> <path class="st0" d="M256,198.494c-24.037,0.008-45.646,9.768-61.446,25.68c-15.76,15.94-25.496,37.826-25.519,62.17 c0.023,24.361,9.759,46.238,25.519,62.151c15.8,15.931,37.409,25.698,61.446,25.698c24.009,0,45.642-9.767,61.432-25.698 c15.778-15.912,25.514-37.79,25.523-62.151c-0.008-24.344-9.754-46.23-25.523-62.17C301.642,208.262,280.009,198.502,256,198.494z M256,340.506c-29.657,0-53.689-24.235-53.689-54.163c0-29.919,24.032-54.163,53.689-54.163c29.657,0,53.688,24.244,53.688,54.163 C309.688,316.272,285.657,340.506,256,340.506z" style="fill: rgb(255, 255, 255);"></path> <path class="st0" d="M496.774,135.592c-9.344-9.461-22.509-15.416-36.886-15.416h-56.404c-4.545,0.018-8.783-2.702-10.734-7.093 l-16.898-37.826c-8.358-18.741-26.936-30.931-47.557-30.931H183.706c-20.616,0-39.199,12.19-47.576,30.931l-16.88,37.826 c-1.952,4.391-6.195,7.111-10.731,7.093H52.112c-14.372,0-27.56,5.954-36.922,15.416C5.824,145.026,0,158.21,0,172.569v242.73 c0,14.368,5.824,27.543,15.19,36.976c9.361,9.462,22.554,15.416,36.922,15.398h224.554h183.222 c14.378,0.018,27.543-5.937,36.886-15.398c9.407-9.433,15.226-22.608,15.226-36.976v-242.73 C512,158.21,506.181,145.008,496.774,135.592z M339.458,370.334c-21.276,21.515-50.887,34.89-83.458,34.89 c-32.585,0-62.182-13.374-83.463-34.89c-21.321-21.46-34.523-51.262-34.504-83.991c-0.019-32.729,13.184-62.504,34.504-84 c21.28-21.498,50.874-34.889,83.463-34.862c32.571-0.027,62.182,13.364,83.458,34.862c21.321,21.497,34.532,51.271,34.505,84 C373.99,319.072,360.779,348.874,339.458,370.334z M461.967,214.542h-35.793V178.74h35.793V214.542z" style="fill: rgb(255, 255, 255);"></path> </g> </svg>';
  screenShotButton.addEventListener("click", () => {
    let canvas = document.createElement("canvas");
    canvas.width = parseInt(video.style.width);
    canvas.height = parseInt(video.style.height);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    function blobCallback(filename) {
      return function(blob) {
        const browser = getBrowser();
        if (browser === "Chrome") {
          const url = window.URL.createObjectURL(blob);
          chrome.runtime.sendMessage(
            {
              id: "download-screenshot",
              data: { browser, url, filename }
            },
            () => {
              window.URL.revokeObjectURL(url);
            }
          );
        } else if (browser === "Firefox") {
          chrome.runtime.sendMessage({
            id: "download-screenshot",
            data: { browser, blob, filename }
          });
        }
      };
    }
    const titleLink = document.querySelector(
      ".ytp-title-link.yt-uix-sessionlink"
    );
    const liveTitle = titleLink.innerHTML;
    const ytpProgressBar = document.querySelector(".ytp-progress-bar");
    const currentTime = ytpProgressBar
      .getAttribute("aria-valuetext")
      .split("/")[0]
      .replace(/\s+/g, "");
    const filename = liveTitle + "_" + currentTime + ".png";
    canvas.toBlob(blobCallback(filename));
  });
  parent.insertBefore(screenShotButton, chatButton);

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

  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      closeButton.style.display = "none";
      resizeHandle.style.display = "none";
      hide();
      html5player.style.cursor = "none";
    }, 2000);
  };

  resetTimer();

  document.addEventListener("mousemove", e => {
    chrome.runtime.sendMessage({
      id: "yt-mousemove",
      data: {
        winType: "video",
        youtubeId: youtubeId,
        pageX: e.pageX,
        pageY: e.pageY
      }
    });
  });
  document.addEventListener("mouseup", e => {
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
      resetTimer();
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
    if (
      e.targettagName === "video" ||
      e.target.classList.contains("ytp-offline-slate")
    ) {
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
  });
  player.addEventListener("mouseup", e => {
    if (e.which == 1) {
      show();
      closeButton.style.display = "block";
      resizeHandle.style.display = "block";
      resetTimer();
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
  });
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
        if (data.youtubeId === youtubeId) {
          chrome.runtime.sendMessage({
            id: "player-loaded",
            data: { youtubeId: youtubeId }
          });
        }
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
          const titleLink = document.querySelector(
            ".ytp-title-link.yt-uix-sessionlink"
          );
          if (titleLink) {
            const liveTitle = titleLink.innerHTML;
            chrome.runtime.sendMessage({
              id: "live-title",
              data: { liveTitle: liveTitle, youtubeId: youtubeId }
            });
          }
        }
        break;
      case "request-owner-name":
        if (data.youtubeId === youtubeId) {
          const expandedTitle = document.querySelector(
            ".ytp-title-expanded-title a"
          );
          if (expandedTitle) {
            const ownerName = expandedTitle.innerHTML;
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

window.addEventListener("load", onLoad, false);
