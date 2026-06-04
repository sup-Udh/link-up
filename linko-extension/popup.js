let BASE_URL = "http://localhost";

// Automatically update BASE_URL if the user opens the popup while on the dashboard/connect page
function detectBaseUrl() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        try {
          const url = new URL(activeTab.url);
          const hostname = url.hostname;
          if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname.includes("linko") ||
            hostname.includes("ngrok-free.app")
          ) {
            const detectedUrl = url.origin;
            chrome.storage.local.set({ savedBaseUrl: detectedUrl }, () => {
              resolve(detectedUrl);
            });
            return;
          }
        } catch (e) {
          console.error("Error parsing tab URL for BASE_URL detection", e);
        }
      }
      chrome.storage.local.get(["savedBaseUrl"], (result) => {
        resolve(result.savedBaseUrl || "http://localhost");
      });
    });
  });
}

// DOM Elements
const viewLoading = document.getElementById("view-loading");
const viewUnauth = document.getElementById("view-unauth");
const viewPairing = document.getElementById("view-pairing");
const viewAuth = document.getElementById("view-auth");
const statusEl = document.getElementById("status");

// Unauth View
const btnConnect = document.getElementById("btn-connect");
const btnShowPairing = document.getElementById("btn-show-pairing");

// Pairing View
const inputPairing = document.getElementById("pairingCode");
const btnVerify = document.getElementById("btn-verify");
const btnCancelPairing = document.getElementById("btn-cancel-pairing");

// Auth View
const avatarEl = document.getElementById("user-avatar");
const nameEl = document.getElementById("user-name");
const emailEl = document.getElementById("user-email");
const requireApprovalCheckbox = document.getElementById("requireApproval");
const startBtn = document.getElementById("start");
const btnDisconnect = document.getElementById("btn-disconnect");

// Helper to switch views
function showView(view) {
  document
    .querySelectorAll(".view")
    .forEach((el) => el.classList.remove("active"));
  view.classList.add("active");
}

function showStatus(msg, color = "#555") {
  statusEl.textContent = msg;
  statusEl.style.color = color;
}

// Check auth state on load
async function checkAuth() {
  showView(viewLoading);
  showStatus("");

  BASE_URL = await detectBaseUrl();
  console.log("Using BASE_URL:", BASE_URL);

  chrome.storage.local.get(
    ["extensionToken", "requireApproval"],
    async (result) => {
      if (result.requireApproval !== undefined) {
        requireApprovalCheckbox.checked = result.requireApproval;
      }

      if (!result.extensionToken) {
        showView(viewUnauth);
        return;
      }

      // Verify token with backend
      try {
        const response = await fetch(`${BASE_URL}/api/extension/me`, {
          headers: { Authorization: `Bearer ${result.extensionToken}` },
        });

        if (!response.ok) throw new Error("Invalid token");

        const user = await response.json();

        // Update Auth UI
        nameEl.textContent = user.name || "User";
        emailEl.textContent = user.email || "";
        if (user.avatar) {
          avatarEl.style.backgroundImage = `url(${user.avatar})`;
        }

        showView(viewAuth);
      } catch (err) {
        console.error(err);
        chrome.storage.local.remove(["extensionToken"]);
        showView(viewUnauth);
      }
    },
  );
}

// INIT
checkAuth();

// --- EVENT LISTENERS ---

// Connect Account
btnConnect.addEventListener("click", () => {
  chrome.tabs.create({ url: `${BASE_URL}/extension/connect` });
});

// Show Pairing
btnShowPairing.addEventListener("click", () => {
  showView(viewPairing);
});

// Cancel Pairing
btnCancelPairing.addEventListener("click", () => {
  showView(viewUnauth);
  inputPairing.value = "";
  showStatus("");
});

// Format pairing code automatically
inputPairing.addEventListener("input", (e) => {
  let val = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (val.length > 4) {
    val = val.substring(0, 4) + "-" + val.substring(4, 8);
  }
  e.target.value = val;
});

// Verify Code
btnVerify.addEventListener("click", async () => {
  const code = inputPairing.value;
  if (code.length !== 9) {
    showStatus("Please enter a valid code", "red");
    return;
  }

  showStatus("Verifying...", "#1cbaba");
  btnVerify.disabled = true;

  try {
    const response = await fetch(`${BASE_URL}/api/extension/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to verify");

    // Save token
    chrome.storage.local.set({ extensionToken: data.token });

    // Update Auth UI
    nameEl.textContent = data.user.name || "User";
    emailEl.textContent = data.user.email || "";
    if (data.user.avatar) {
      avatarEl.style.backgroundImage = `url(${data.user.avatar})`;
    }

    showStatus("Connected successfully!", "green");
    setTimeout(() => {
      showView(viewAuth);
      showStatus("");
    }, 1000);
  } catch (err) {
    showStatus(err.message, "red");
  } finally {
    btnVerify.disabled = false;
  }
});

// Save checkbox state
requireApprovalCheckbox.addEventListener("change", (e) => {
  chrome.storage.local.set({ requireApproval: e.target.checked });
});

// Disconnect
btnDisconnect.addEventListener("click", async () => {
  showStatus("Disconnecting...", "#1cbaba");
  chrome.storage.local.get(["extensionToken"], async (result) => {
    if (result.extensionToken) {
      try {
        await fetch(`${BASE_URL}/api/extension/revoke`, {
          method: "POST",
          headers: { Authorization: `Bearer ${result.extensionToken}` },
        });
      } catch (err) {
        console.error("Failed to revoke token remotely");
      }
    }
    chrome.storage.local.remove(["extensionToken"]);
    showView(viewUnauth);
    showStatus("");
  });
});

// Start Session
startBtn.addEventListener("click", async () => {
  const requireApproval = requireApprovalCheckbox.checked;

  chrome.storage.local.get(["extensionToken"], async (result) => {
    if (!result.extensionToken) {
      showStatus("Please connect your account first.", "red");
      return;
    }

    try {
      showStatus("Reading problem...", "#555");

      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tab = tabs[0];

      if (!tab || !tab.url.includes("leetcode.com/problems/")) {
        throw new Error("Please navigate to a LeetCode problem page.");
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_PROBLEM" },
        async (problem) => {
          if (chrome.runtime.lastError) {
            showStatus(
              "Error: Please refresh the LeetCode page and try again.",
              "red",
            );
            return;
          }

          if (!problem || problem.error) {
            showStatus(problem?.error || "Failed to read problem data.", "red");
            return;
          }

          try {
            showStatus("Creating room...", "#1cbaba");

            const response = await fetch(`${BASE_URL}/api/rooms`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${result.extensionToken}`,
              },
              body: JSON.stringify({
                slug: problem.slug,
                url: problem.url,
                // displayName is no longer needed from client, server infers from token!
              }),
            });

            if (!response.ok) {
              throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            showStatus("Opening collaborative room...", "green");

            // Open the room in a new tab
            chrome.tabs.create({
              url: `${BASE_URL}/room/${data.roomId}?requireApproval=${requireApproval}`,
            });
          } catch (err) {
            showStatus(`Error: ${err.message}`, "red");
          }
        },
      );
    } catch (err) {
      showStatus(`Error: ${err.message}`, "red");
    }
  });
});
