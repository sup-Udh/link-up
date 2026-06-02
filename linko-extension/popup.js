document
  .getElementById("start")
  .addEventListener("click", async () => {

    const tabs =
      await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

    const tab = tabs[0];

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "GET_PROBLEM"
      },
      async (problem) => {

        console.log(problem);

      }
    );

  });