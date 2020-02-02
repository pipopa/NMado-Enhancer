import { initWatcher } from "./watcher.js";
import { initDragger } from "./dragger.js";
import { initHider } from "./hider.js";

class ChatEnahncer {
  constructor(watcher, hider) {
    this.watcher = watcher;
    this.hider = hider;
  }
}

const initEnhancer = async youtubeId => {
  let watcher = await initWatcher(youtubeId);
  initDragger(youtubeId);
  let hider = initHider();
  return new ChatEnahncer(watcher, hider);
};

export { initEnhancer };
