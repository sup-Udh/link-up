function createIcon(color) {
  const size = 128;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background with subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  if (color === 'orange') {
    gradient.addColorStop(0, '#ffa116');
    gradient.addColorStop(1, '#ffb84d');
  } else {
    gradient.addColorStop(0, '#555555');
    gradient.addColorStop(1, '#777777');
  }
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 24);
  ctx.fill();

  // Glow effect for orange
  if (color === 'orange') {
    ctx.shadowColor = '#ffa116';
    ctx.shadowBlur = 15;
  }

  // Draw Code2 icon (white)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const s = size / 24; // Scale factor from 24x24 viewBox
  
  // Right bracket
  ctx.beginPath();
  ctx.moveTo(16 * s, 18 * s);
  ctx.lineTo(22 * s, 12 * s);
  ctx.lineTo(16 * s, 6 * s);
  ctx.stroke();

  // Left bracket
  ctx.beginPath();
  ctx.moveTo(8 * s, 6 * s);
  ctx.lineTo(2 * s, 12 * s);
  ctx.lineTo(8 * s, 18 * s);
  ctx.stroke();

  // Reset shadow for data extraction
  ctx.shadowBlur = 0;

  return ctx.getImageData(0, 0, size, size);
}

// Generate image data once
const greyIcon = { '128': createIcon('grey') };
const orangeIcon = { '128': createIcon('orange') };

// Set the global default icon to grey
chrome.action.setIcon({ imageData: greyIcon });

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("leetcode.com/problems")) {
    chrome.action.setIcon({ tabId: tabId, imageData: orangeIcon });
  } else {
    chrome.action.setIcon({ tabId: tabId, imageData: greyIcon });
  }
});

// Also check active tab when switching tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url && tab.url.includes("leetcode.com/problems")) {
    chrome.action.setIcon({ tabId: activeInfo.tabId, imageData: orangeIcon });
  } else {
    chrome.action.setIcon({ tabId: activeInfo.tabId, imageData: greyIcon });
  }
});
