// Set the global default icon to grey
chrome.action.setIcon({ path: { "128": "icon-grey.png" } });

function isSupportedProblemUrl(url) {
  if (!url) return false;
  return url.includes("leetcode.com/problems") || url.includes("neetcode.io/problems");
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url;
  if (isSupportedProblemUrl(url)) {
    chrome.action.setIcon({ tabId: tabId, path: { "128": "icon-orange.png" } });
  } else if (url) {
    chrome.action.setIcon({ tabId: tabId, path: { "128": "icon-grey.png" } });
  }
});

// Also check active tab when switching tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (isSupportedProblemUrl(tab.url)) {
    chrome.action.setIcon({ tabId: activeInfo.tabId, path: { "128": "icon-orange.png" } });
  } else if (tab.url) {
    chrome.action.setIcon({ tabId: activeInfo.tabId, path: { "128": "icon-grey.png" } });
  }
});
