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



// import { getProblemData } from "@/app/lib/leetcode";

// console.log("Linko Content Script Loaded");

// chrome.runtime.onMessage.addListener(
//   async (message, sender, sendResponse) => {
//     if (message.type !== "GET_PROBLEM") {
//       return;
//     }

//     try {
//       const parts = window.location.pathname
//         .split("/")
//         .filter(Boolean);

//       if (
//         parts.length < 2 ||
//         parts[0] !== "problems"
//       ) {
//         sendResponse({
//           error: "Not on a LeetCode problem page",
//         });

//         return;
//       }

//       const slug = parts[1];

//       console.log("Fetching:", slug);

//       const problemData = await getProblemData(slug);

//       sendResponse({
//         ...problemData,
//         url: window.location.href,
//       });
//     } catch (err) {
//       console.error("Linko Error:", err);

//       sendResponse({
//         error:
//           err instanceof Error
//             ? err.message
//             : "Unknown error",
//       });
//     }

//     return true;
//   }
// );