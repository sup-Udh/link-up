"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type UserType = "Ansh" | "Udhay";

interface SequenceStep {
  user: UserType;
  text: string;
}

interface LanguageSequence {
  language: string;
  filename: string;
  header: string;
  steps: SequenceStep[];
}

const LANGUAGES: LanguageSequence[] = [
  {
    language: "TypeScript",
    filename: "twoSum.ts",
    header: "function twoSum(nums: number[], target: number) {\n",
    steps: [
      { user: "Ansh", text: "  const map = new Map<number, number>();\n" },
      { user: "Udhay", text: "  for(let i = 0; i < nums.length; i++) {\n" },
      { user: "Ansh", text: "    const diff = target - nums[i];\n" },
      { user: "Udhay", text: "    if(map.has(diff)) {\n" },
      { user: "Ansh", text: "      return [map.get(diff)!, i];\n" },
      { user: "Udhay", text: "    }\n" },
      { user: "Ansh", text: "    map.set(nums[i], i);\n" },
      { user: "Udhay", text: "  }\n" },
      { user: "Ansh", text: "  return [];\n" },
      { user: "Udhay", text: "}" }
    ]
  },
  {
    language: "Python",
    filename: "two_sum.py",
    header: "def twoSum(self, nums: List[int], target: int) -> List[int]:\n",
    steps: [
      { user: "Ansh", text: "    hash_map = {}\n" },
      { user: "Udhay", text: "    for i, num in enumerate(nums):\n" },
      { user: "Ansh", text: "        diff = target - num\n" },
      { user: "Udhay", text: "        if diff in hash_map:\n" },
      { user: "Ansh", text: "            return [hash_map[diff], i]\n" },
      { user: "Udhay", text: "        hash_map[num] = i\n" },
      { user: "Ansh", text: "    return []\n" }
    ]
  },
  {
    language: "Java",
    filename: "Solution.java",
    header: "class Solution {\n  public int[] twoSum(int[] nums, int target) {\n",
    steps: [
      { user: "Udhay", text: "    Map<Integer, Integer> map = new HashMap<>();\n" },
      { user: "Ansh", text: "    for (int i = 0; i < nums.length; i++) {\n" },
      { user: "Udhay", text: "      int diff = target - nums[i];\n" },
      { user: "Ansh", text: "      if (map.containsKey(diff)) {\n" },
      { user: "Udhay", text: "        return new int[] { map.get(diff), i };\n" },
      { user: "Ansh", text: "      }\n" },
      { user: "Udhay", text: "      map.put(nums[i], i);\n" },
      { user: "Ansh", text: "    }\n" },
      { user: "Udhay", text: "    return new int[] {};\n" },
      { user: "Ansh", text: "  }\n}" }
    ]
  }
];

export default function CinematicHero() {
  const [completedText, setCompletedText] = useState("");
  const [activeText, setActiveText] = useState("");
  const [activeUser, setActiveUser] = useState<UserType | null>(null);
  
  // 0: hidden, 1: ex1, 2: ex2, 3: ex3, 4: accepted
  const [terminalState, setTerminalState] = useState(0); 
  const [loopIteration, setLoopIteration] = useState(0);

  const currentLangIndex = loopIteration % LANGUAGES.length;
  const currentLang = LANGUAGES[currentLangIndex];

  useEffect(() => {
    let isCancelled = false;
    
    const runAnimation = async () => {
      // 1. Reset state
      setCompletedText("");
      setActiveText("");
      setActiveUser(null);
      setTerminalState(0);
      
      // Wait a moment before starting
      await new Promise(r => setTimeout(r, 1000));
      if (isCancelled) return;
      
      // 2. Iterate through sequence
      for (const step of currentLang.steps) {
        if (isCancelled) return;
        setActiveUser(step.user);
        setActiveText("");
        
        // "Thinking" delay before switching user
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        if (isCancelled) return;
        
        let currentText = "";
        for (let i = 0; i < step.text.length; i++) {
          if (isCancelled) return;
          currentText += step.text[i];
          setActiveText(currentText);
          
          // Realistic dynamic typing delay
          let delay = 30 + Math.random() * 60; // 30-90ms
          const char = step.text[i];
          if (char === ';') delay = 300;
          else if (char === '\n') delay = 200;
          else if (char === '{' || char === '}') delay = 150;
          else if (char === ' ') delay = 20;
          
          await new Promise(r => setTimeout(r, delay));
        }
        
        // Step complete, move active to completed
        setCompletedText(prev => prev + step.text);
        setActiveText("");
      }
      
      setActiveUser(null);
      if (isCancelled) return;
      
      // 3. Wait a moment then show terminal
      await new Promise(r => setTimeout(r, 800));
      if (isCancelled) return;
      
      setTerminalState(1); // Show terminal, Example 1
      await new Promise(r => setTimeout(r, 800));
      if (isCancelled) return;
      
      setTerminalState(2); // Example 2
      await new Promise(r => setTimeout(r, 800));
      if (isCancelled) return;
      
      setTerminalState(3); // Example 3
      await new Promise(r => setTimeout(r, 800));
      if (isCancelled) return;
      
      setTerminalState(4); // Accepted
      
      // 4. Wait 3 seconds then loop
      await new Promise(r => setTimeout(r, 3000));
      if (isCancelled) return;
      
      setLoopIteration(i => i + 1);
    };
    
    runAnimation();
    
    return () => { isCancelled = true; };
  }, [loopIteration, currentLang]);

  // Advanced Regex Syntax Highlighter (supports TS, Python, Java)
  const highlight = (code: string) => {
    let highlighted = code
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\b(function|const|let|return|new|if|for|def|self|class|public)\b/g, '<span class="text-[#d81b60] dark:text-[#ff7eb6]">$&</span>') // Pink for keywords
      .replace(/\b(twoSum)\b/g, '<span class="text-[#1976d2] dark:text-[#82aaff]">$&</span>') // Blue for function name
      .replace(/\b(Map|HashMap|List|Solution)\b/g, '<span class="text-[#00796b] dark:text-[#2cbb5d]">$&</span>') // Green for class name
      .replace(/\b(number|int)\b/g, '<span class="text-[#00796b] dark:text-[#2cbb5d]">$&</span>') // Green for types
      .replace(/\b(\d+)\b/g, '<span class="text-[#e53935] dark:text-[#f07178]">$&</span>'); // Red/orange for numbers
    return { __html: highlighted };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-3xl mx-auto flex flex-col font-mono text-sm sm:text-base relative drop-shadow-2xl"
    >
      {/* Editor Window */}
      <div className={`border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1e1e] flex flex-col relative z-10 transition-all duration-500 overflow-hidden ${terminalState > 0 ? 'rounded-t-xl h-[350px]' : 'rounded-xl h-[450px]'}`}>
        
        {/* Ambient Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffa116]/5 to-[#2cbb5d]/5 pointer-events-none" />
        
        {/* Presence Header */}
        <div className="h-12 bg-gray-100 dark:bg-[#282828] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 shrink-0 relative z-20 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-[#1e1e1e] rounded text-gray-500 dark:text-gray-400 text-xs flex items-center gap-2 border border-gray-200 dark:border-white/5 shadow-sm transition-colors duration-300">
              <span className="text-[#ffa116] font-bold">{currentLang.language.substring(0, 2).toUpperCase()}</span> {currentLang.filename}
            </div>
          </div>

          {/* Online Indicators */}
          <div className="flex items-center gap-4 text-xs font-sans font-medium">
            <div className={`flex items-center gap-1.5 transition-opacity ${activeUser === 'Udhay' ? 'opacity-100' : 'opacity-40'}`}>
              <span className="w-2 h-2 rounded-full bg-[#ffa116] animate-pulse shadow-[0_0_8px_rgba(255,161,22,0.8)]" />
              <span className="text-gray-700 dark:text-gray-300">Udhay Online</span>
            </div>
            <div className={`flex items-center gap-1.5 transition-opacity ${activeUser === 'Ansh' ? 'opacity-100' : 'opacity-40'}`}>
              <span className="w-2 h-2 rounded-full bg-[#2cbb5d] animate-pulse shadow-[0_0_8px_rgba(44,187,93,0.8)]" />
              <span className="text-gray-700 dark:text-gray-300">Ansh Online</span>
            </div>
          </div>
        </div>
        
        {/* Editor Body */}
        <div className="p-4 sm:p-6 text-gray-800 dark:text-gray-300 flex-1 overflow-y-auto relative z-10 scrollbar-hide transition-colors duration-300">
          
          {/* Active Typing Notification */}
          <div className="absolute top-4 right-6 text-xs text-gray-500 dark:text-gray-400 font-sans italic opacity-70 transition-opacity">
            {activeUser ? `${activeUser} is typing...` : ''}
          </div>

          <div className="flex gap-4 sm:gap-6">
            {/* Line Numbers */}
            <div className="flex flex-col text-gray-400 dark:text-gray-600 select-none text-right opacity-50">
              {[...Array(14)].map((_, i) => (
                <span key={i} className="leading-loose">{i + 1}</span>
              ))}
            </div>

            {/* Code Content */}
            <div className="flex-1 relative">
              <div className="leading-loose whitespace-pre font-mono">
                {/* Static Header */}
                <span dangerouslySetInnerHTML={highlight(currentLang.header)} />
                
                {/* Completed Typed Text */}
                <span dangerouslySetInnerHTML={highlight(completedText)} />
                
                {/* Actively Typing Text & Cursor */}
                {activeUser && (
                  <span className="relative">
                    <span dangerouslySetInnerHTML={highlight(activeText)} />
                    <span className={`inline-block w-[2px] h-[16px] align-middle animate-pulse relative ${activeUser === 'Udhay' ? 'bg-[#ffa116]' : 'bg-[#2cbb5d]'}`}>
                      <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-black font-semibold text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg ${activeUser === 'Udhay' ? 'bg-[#ffa116]' : 'bg-[#2cbb5d]'}`}>
                        {activeUser}
                      </span>
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-up Terminal Pane */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: terminalState > 0 ? 140 : 0, opacity: terminalState > 0 ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="border-x border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#282828] rounded-b-xl overflow-hidden flex flex-col shrink-0 relative z-0 transition-colors duration-300"
      >
        <div className="h-8 bg-gray-200 dark:bg-[#1e1e1e] border-b border-gray-300 dark:border-white/5 flex items-center px-4 text-xs text-gray-600 dark:text-gray-400 font-sans transition-colors duration-300">
          Terminal - Test Results
        </div>
        <div className="p-4 text-sm font-mono flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          {terminalState >= 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-gray-700 dark:text-gray-300">
              Example 1: <span className="text-[#2cbb5d] font-semibold dark:font-normal">✓ Passed</span>
            </motion.div>
          )}
          {terminalState >= 2 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-gray-700 dark:text-gray-300">
              Example 2: <span className="text-[#2cbb5d] font-semibold dark:font-normal">✓ Passed</span>
            </motion.div>
          )}
          {terminalState >= 3 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-gray-700 dark:text-gray-300">
              Example 3: <span className="text-[#2cbb5d] font-semibold dark:font-normal">✓ Passed</span>
            </motion.div>
          )}
          {terminalState >= 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 p-3 bg-[#2cbb5d]/10 border border-[#2cbb5d]/20 rounded-lg">
              <div className="text-[#2cbb5d] font-bold mb-1">✓ Accepted</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex gap-4">
                <span>Runtime: 48ms</span>
                <span>Memory: 41MB</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
