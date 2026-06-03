console.log("Linko Content Script Loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PROBLEM") {
    const parts = window.location.pathname.split("/").filter(Boolean);
    
    // Validate we are on a LeetCode problem page
    if (parts.length >= 2 && parts[0] === "problems") {
      const slug = parts[1];
      sendResponse({
        slug: slug,
        url: window.location.href
      });
    } else {
      sendResponse({ error: "Not on a LeetCode problem page." });
    }
  }
});