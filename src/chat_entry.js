import { initEnhancer } from "./chat/enhancer.js";

const onLoad = () => {
  // N窓以外では動作させない
  if (!document.referrer.match(/^https:\/\/piporoid.net\/NMado\//)) {
    return;
  }

  const checkTimer = setInterval(check, 1000);
  async function check() {
    if (
      document.querySelector("yt-live-chat-header-renderer") === null &&
      document.querySelector("yt-formatted-string") === null
    ) {
      return;
    }
    clearInterval(checkTimer);
    main();
  }
};
const main = async () => {
  const re = /https:\/\/www.youtube\.com\/live_chat\?.*v=(.+)&/;
  const youtubeId = re.exec(location.href)[1];
  let setIcon = false;

  let enhancer = await initEnhancer(youtubeId);
  chrome.runtime.sendMessage({
    id: "request-channel-icon",
    data: { youtubeId: youtubeId }
  });

  chrome.runtime.onMessage.addListener(message => {
    const { id, data } = message;
    switch (id) {
      case "player-loaded":
        if (data.youtubeId === youtubeId) {
          chrome.runtime.sendMessage({
            id: "request-channel-icon",
            data: { youtubeId: youtubeId }
          });
          chrome.runtime.sendMessage({
            id: "request-live-title",
            data: { youtubeId: youtubeId }
          });
          chrome.runtime.sendMessage({
            id: "request-owner-name",
            data: { youtubeId: youtubeId }
          });
        }
      case "nmado-mouseup":
        //header.style.pointerEvents = 'auto'
        break;
      case "yt-mousedown":
        //header.style.pointerEvents = 'none'
        break;
      case "yt-mouseup":
        //header.style.pointerEvents = 'auto'
        break;
      case "channel-icon":
        if (
          !setIcon &&
          data.youtubeId === youtubeId &&
          !enhancer.watcher.getOwnerIconUrl()
        ) {
          setIcon = true;
          enhancer.watcher.setOwnerIconUrl(data.url);
          const icon = document.createElement("div");
          icon.classList.add("channel-icon");
          icon.style.backgroundImage = 'url("" + data.url + "")';
          const ytpButton = document.querySelector("yt-icon-button#overflow");
          let header = document.querySelector("yt-live-chat-header-renderer");
          header.insertBefore(icon, ytpButton);
        }
        break;
      case "live-title":
        if (data.youtubeId === youtubeId) {
          enhancer.watcher.setLiveTitle(data.liveTitle);
        }
        break;
      case "owner-name":
        if (data.youtubeId === youtubeId) {
          enhancer.watcher.setOwnerName(data.ownerName);
        }
        break;
    }
  });
};
window.addEventListener("load", onLoad, false);
