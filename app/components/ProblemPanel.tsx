import { getSlugForRoom } from "@/app/lib/db";
import { fetchLeetCodeProblem } from "@/app/lib/leetcode";
import { normalizeProblem } from "@/app/lib/problem-engine/normalizeProblem";

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

  try {
    const raw = await fetchLeetCodeProblem(slug);
    const problem = normalizeProblem(raw);

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
        <div className="flex items-center gap-3 mb-4">
          <span className={`font-semibold ${difficultyColor}`}>
            {problem.difficulty}
          </span>
          {problem.topicTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {problem.topicTags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div dangerouslySetInnerHTML={{ __html: problem.content }} />
        {problem.hints.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Hints</h3>
            {problem.hints.map((hint, i) => (
              <details key={i} className="mb-2">
                <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                  Hint {i + 1}
                </summary>
                <p className="text-sm text-gray-400 mt-1 pl-4" dangerouslySetInnerHTML={{ __html: hint }} />
              </details>
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    return (
      <div className="p-4 h-full bg-[#282828] text-white">
        <h2 className="font-bold text-xl text-red-500">Error</h2>
        <p className="mt-4 text-gray-400">Failed to load problem data from LeetCode.</p>
      </div>
    );
  }
}