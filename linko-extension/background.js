// Set the global default icon to grey
chrome.action.setIcon({ path: { "128": "icon-grey.png" } });

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab.url;
  if (url && url.includes("leetcode.com/problems")) {
    chrome.action.setIcon({ tabId: tabId, path: { "128": "icon-orange.png" } });
  } else if (url) {
    chrome.action.setIcon({ tabId: tabId, path: { "128": "icon-grey.png" } });
  }
});

// Also check active tab when switching tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url && tab.url.includes("leetcode.com/problems")) {
    chrome.action.setIcon({ tabId: activeInfo.tabId, path: { "128": "icon-orange.png" } });
  } else if (tab.url) {
    chrome.action.setIcon({ tabId: activeInfo.tabId, path: { "128": "icon-grey.png" } });
  }
});
