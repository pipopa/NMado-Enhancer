const hideChatKey = "hideChat";

const getStorageData = key => {
  return new Promise(resolve => {
    chrome.storage.local.get(key, value => {
      resolve(value);
    });
  });
};

class Hider {
  constructor() {
    this.focus = false;
  }
}

const initHider = async () => {
  const storageData = await getStorageData(hideChatKey);
  const hideChat = storageData[hideChatKey];
  let hider = new Hider();

  if (hideChat) {
    let inputPanel = document.querySelector("div#input-panel");
    inputPanel.style.display = "none";
    inputPanel.addEventListener("mousedown", () => {
      inputPanel.style.display = "block";
      hider.focus = true;
    });
    window.addEventListener("blur", () => {
      inputPanel.style.display = "none";
      hider.focus = false;
    });
    document.addEventListener("mouseover", () => {
      inputPanel.style.display = "block";
    });
    document.addEventListener("mouseout", () => {
      if (!hider.focus) {
        inputPanel.style.display = "none";
      }
    });
  }
  return hider;
};

export { initHider };
