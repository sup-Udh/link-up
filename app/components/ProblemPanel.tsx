import { getSlugForRoom } from "@/app/lib/db";
import { getProblemData } from "@/app/lib/leetcode";

export default async function ProblemPanel({ roomId }: { roomId: string }) {
  const slug = await getSlugForRoom(roomId);
  
  if (!slug) {
    return (
      <div className="p-4 h-full bg-[#282828] text-white">
        <h2 className="font-bold text-xl">Waiting for problem...</h2>
        <p className="mt-4 text-gray-400">Launch a session from the Linko Chrome extension on a LeetCode problem page to sync the problem description here.</p>
      </div>
    );
  }

  const problem = await getProblemData(slug);

  if (!problem) {
    return (
      <div className="p-4 h-full bg-[#282828] text-white">
        <h2 className="font-bold text-xl text-red-500">Error</h2>
        <p className="mt-4 text-gray-400">Failed to load problem data from LeetCode.</p>
      </div>
    );
  }

  const difficultyColor = 
    problem.difficulty === "Easy" ? "text-green-500" :
    problem.difficulty === "Medium" ? "text-yellow-500" : "text-red-500";

  return (
    <div className="p-6 h-full overflow-y-auto bg-[#282828] text-gray-200 leetcode-content">
      <style dangerouslySetInnerHTML={{ __html: `
        .leetcode-content pre {
          background-color: #383838;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
          overflow-x: auto;
        }
        .leetcode-content code {
          color: #ff9fb1;
          font-family: monospace;
          background-color: rgba(255, 159, 177, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
        }
        .leetcode-content pre code {
          background-color: transparent;
          padding: 0;
          color: #e2e8f0;
        }
        .leetcode-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .leetcode-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .leetcode-content strong {
          color: #fff;
        }
      `}} />
      <h2 className="font-bold text-2xl mb-2">{problem.title}</h2>
      <div className={`font-semibold mb-6 ${difficultyColor}`}>
        {problem.difficulty}
      </div>
      <div dangerouslySetInnerHTML={{ __html: problem.content }} />
    </div>
  );
}