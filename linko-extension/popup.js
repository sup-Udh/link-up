document.getElementById("start").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  
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

        const response = await fetch("https://handiness-glucose-munchkin.ngrok-free.dev/api/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            slug: problem.slug,
            url: problem.url
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

        chrome.tabs.create({ url: `https://handiness-glucose-munchkin.ngrok-free.dev/room/${data.roomId}` });
        
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