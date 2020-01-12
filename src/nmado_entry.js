document.addEventListener("mouseup", () =>
  chrome.runtime.sendMessage({ id: "nmado-mouseup", data: {} })
);
cloneInto = typeof cloneInto !== "undefined" ? cloneInto : obj => obj;

chrome.runtime.onMessage.addListener(message => {
  const { id, data } = message;
  let event;
  let cloneDetail;
  let win;
  switch (id) {
    case "yt-mousedown":
      cloneDetail = cloneInto(
        {
          pageX: data.pageX,
          pageY: data.pageY,
          which: data.which,
          action: data.action
        },
        document.defaultView
      );
      if (data.which === 2) {
        event = new CustomEvent("yt-mousedown-middle", {
          detail: cloneDetail,
          cancelable: true
        });
      } else {
        event = new CustomEvent("yt-mousedown", {
          detail: cloneDetail,
          cancelable: true
        });
      }
      document
        .querySelector(
          `div.window[data-youtubeid="${data.winType}-${data.youtubeId}"] div.edit-window`
        )
        .dispatchEvent(event);
      break;
    case "yt-mousemove":
      win = document.querySelector(
        `div.window[data-youtubeid="${data.winType}-${data.youtubeId}"] div.edit-window`
      );
      cloneDetail = cloneInto(
        {
          pageX: data.pageX + parseInt(win.style.left, 10),
          pageY: data.pageY + parseInt(win.style.top, 10)
        },
        document.defaultView
      );
      event = new CustomEvent("yt-mousemove", {
        detail: cloneDetail,
        cancelable: true
      });
      document.documentElement.dispatchEvent(event);
      break;
    case "yt-mouseup":
      if (data.which == 1) {
        win = document.querySelector(
          `div.window[data-youtubeid="${data.winType}-${data.youtubeId}"] div.edit-window`
        );
        cloneDetail = cloneInto(
          {
            pageX: data.pageX + parseInt(win.style.left, 10),
            pageY: data.pageY + parseInt(win.style.top, 10),
            which: data.which
          },
          document.defaultView
        );
        event = new CustomEvent("yt-mouseup", {
          detail: cloneDetail,
          cancelable: true
        });
        document.documentElement.dispatchEvent(event);
      }
      break;
    case "yt-close":
      event = new CustomEvent("yt-click", {
        cancelable: true
      });
      document
        .querySelector(
          `div.window[data-youtubeid="${data.winType}-${data.youtubeId}"] div.close`
        )
        .dispatchEvent(event);
      break;
    case "yt-click-showchat":
      event = new CustomEvent("yt-click", {
        cancelable: true
      });
      document
        .querySelector(
          `div.window[data-youtubeid="${data.winType}-${data.youtubeId}"] button.show-chat-button`
        )
        .dispatchEvent(event);
      break;
  }
});
