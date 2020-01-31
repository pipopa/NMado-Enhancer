import { initWatcher } from "./watcher.js";
import { initDragger } from "./dragger.js";
import { initHider } from "./hider.js";

class ChatEnahncer {
  constructor(watcher) {
    this.watcher = watcher
  }
}

const initEnhancer = async (youtubeId) => {
  let watcher = await initWatcher(youtubeId);
  initDragger(youtubeId);
  initHider();
  return new ChatEnahncer(watcher);
}

export {
  initEnhancer
}
