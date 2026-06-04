import returnSlugText from "@/app/lib/leetcode";
import fetchProblemData from "@/app/lib/fetchProblemData";
console.log("Linko Content Script Loaded");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PROBLEM") {
    const parts = window.location.pathname.split("/").filter(Boolean);
    
    // Validate we are on a LeetCode problem page
    if (parts.length >= 2 && parts[0] === "problems") {
      
      const slug = parts[1];
      fetchProblemData("valid-palindrome").then(problemData => {
        sendResponse({
          slug: slug,
          url: window.location.href,
          title: problemData.title,
          difficulty: problemData.difficulty,
          acceptanceRate: problemData.acceptanceRate
        });
      }).catch(error => {
        sendResponse({ error: "Failed to fetch problem data." });
      });
      const slugText = returnSlugText(slug);
      sendResponse({
        slug: slug,
        url: window.location.href
      });
    } else {
      sendResponse({ error: "Not on a LeetCode problem page." });
    } 
  }
});

// Ping the web app to indicate extension is alive AND connected
const hostname = window.location.hostname;
if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('linko') || hostname.includes('ngrok-free.app')) {
  setInterval(() => {
    chrome.storage.local.get(["extensionToken"], (result) => {
      if (result.extensionToken) {
        window.postMessage({ type: 'LINKO_EXTENSION_LIVE' }, '*');
      }
    });
  }, 2000);
}
