const nameInput = document.getElementById("displayName");
const requireApprovalCheckbox = document.getElementById("requireApproval");
const startBtn = document.getElementById("start");
const statusEl = document.getElementById("status");

// Load saved name on popup open
chrome.storage.local.get(["displayName"], (result) => {
  if (result.displayName) {
    nameInput.value = result.displayName;
  }
});

startBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const requireApproval = requireApprovalCheckbox.checked;
  
  if (name.length < 2 || name.length > 24) {
    statusEl.textContent = "Display name must be between 2 and 24 characters.";
    statusEl.style.color = "red";
    return;
  }
  
  // Persist name across restarts
  chrome.storage.local.set({ displayName: name });
  
  try {
    statusEl.textContent = "Reading problem...";
    statusEl.style.color = "#555";

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab || !tab.url.includes("leetcode.com/problems/")) {
      throw new Error("Please navigate to a LeetCode problem page.");
    }

    chrome.tabs.sendMessage(tab.id, { type: "GET_PROBLEM" }, async (problem) => {
      if (chrome.runtime.lastError) {
        statusEl.textContent = "Error: Please refresh the LeetCode page and try again.";
        statusEl.style.color = "red";
        console.error(chrome.runtime.lastError);
        return;
      }

      if (!problem || problem.error) {
        statusEl.textContent = problem?.error || "Failed to read problem data.";
        statusEl.style.color = "red";
        return;
      }

      try {
        statusEl.textContent = "Creating room...";
        
        const response = await fetch("http://localhost/api/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            slug: problem.slug,
            url: problem.url,
            displayName: name
          })
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.roomId) {
          throw new Error("Invalid response from server (missing roomId).");
        }

        statusEl.textContent = "Opening collaborative room...";
        statusEl.style.color = "green";

        // Append the name parameter so the web app receives it immediately
        chrome.tabs.create({ url: `http://localhost/room/${data.roomId}?name=${encodeURIComponent(name)}&requireApproval=${requireApproval}` });
        
      } catch (err) {
        statusEl.textContent = `Error: ${err.message}`;
        statusEl.style.color = "red";
        console.error("Room creation failed:", err);
      }
    });
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.style.color = "red";
    console.error("Popup error:", err);
  }
});