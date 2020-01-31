const hideChatKey = 'hideChat';

const getStorageData = (key) => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
}

const initHider = async () => {
  const storageData = await getStorageData(hideChatKey);
  const hideChat = storageData[hideChatKey];
  if (hideChat) {
    let inputPanel = document.querySelector("div#input-panel");
    inputPanel.style.display = "none";
    document.addEventListener("mouseover", () => {
      let inputPanel = document.querySelector("div#input-panel");
      inputPanel.style.display = "block";
    })
    document.addEventListener("mouseout", () => {
      let inputPanel = document.querySelector("div#input-panel");
      inputPanel.style.display = "none";
    })
  }
}

export {
  initHider
}
