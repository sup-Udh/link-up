console.log("Linko Loaded");

const slug =
  window.location.pathname
    .split("/")
    .filter(Boolean)[1];

console.log(slug);

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    if (message.type === "GET_PROBLEM") {

      sendResponse({
        slug,
        url: window.location.href
      });

    }

  }
);