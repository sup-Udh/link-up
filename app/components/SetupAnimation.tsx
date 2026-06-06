"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, Code2, Puzzle } from "lucide-react";

export default function SetupAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const runSequence = async () => {
      while (!isCancelled) {
        setStep(0); // Web Store
        await new Promise(r => setTimeout(r, 2000));
        if (isCancelled) break;
        
        setStep(1); // Clicking Add
        await new Promise(r => setTimeout(r, 1500));
        if (isCancelled) break;
        
        setStep(2); // LeetCode
        await new Promise(r => setTimeout(r, 2000));
        if (isCancelled) break;
        
        setStep(3); // Popup
        await new Promise(r => setTimeout(r, 2500));
        if (isCancelled) break;
        
        setStep(4); // Room
        await new Promise(r => setTimeout(r, 4000));
        if (isCancelled) break;
      }
    };

    runSequence();
    return () => { isCancelled = true; };
  }, []);

  return (
    <div className="relative w-full max-w-lg aspect-[4/3] bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
      {/* Browser Header */}
      <div className="h-10 bg-gray-200 dark:bg-[#282828] border-b border-gray-300 dark:border-white/10 flex items-center px-4 shrink-0 gap-3 relative z-20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        
        {/* Address Bar */}
        <div className="flex-1 bg-white dark:bg-[#121212] rounded-md h-6 px-3 flex items-center text-[10px] text-gray-500 font-mono overflow-hidden">
          {step < 2 ? "chrome.google.com/webstore" : step < 4 ? "leetcode.com/problems/two-sum" : "linko.app/room/abcd-1234"}
        </div>
        
        {/* Extensions Area */}
        <div className="flex items-center gap-2 text-gray-500">
          <Puzzle size={14} className={step >= 2 ? "text-[#ffa116]" : ""} />
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#121212]">
        
        {/* View 0 & 1: Web Store */}
        <AnimatePresence>
          {(step === 0 || step === 1) && (
            <motion.div 
              className="absolute inset-0 p-6 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffa116] to-[#ffb84d] rounded-xl flex items-center justify-center text-white shrink-0">
                  <Code2 size={32} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Linko</h3>
                  <p className="text-xs text-blue-500 mb-2">Developer Tools</p>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    ★★★★★ <span className="text-gray-400 ml-1">(128)</span>
                  </div>
                </div>
                <div className="ml-auto shrink-0">
                  <motion.div 
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-colors ${step === 1 ? 'bg-gray-100 text-blue-500 border border-gray-200' : 'bg-blue-500 text-white'}`}
                  >
                    {step === 1 ? "Remove" : "Add to Chrome"}
                  </motion.div>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-100 dark:border-white/5 pt-6">
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View 2 & 3: LeetCode */}
        <AnimatePresence>
          {(step === 2 || step === 3) && (
            <motion.div 
              className="absolute inset-0 bg-[#fafafa] dark:bg-[#1a1a1a] flex"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-1/3 border-r border-gray-200 dark:border-white/5 p-4 flex flex-col gap-3">
                <h3 className="text-lg font-bold">1. Two Sum</h3>
                <div className="text-xs text-green-500">Easy</div>
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-full mt-4" />
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-5/6" />
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-4/6" />
              </div>
              <div className="flex-1 p-4 bg-white dark:bg-[#1e1e1e]">
                <div className="text-xs text-blue-500 mb-2">class Solution:</div>
                <div className="text-xs text-gray-500 pl-4">def twoSum(self, nums, target):</div>
              </div>
              
              {/* Linko Popup */}
              <AnimatePresence>
                {step === 3 && (
                  <motion.div 
                    className="absolute top-2 right-2 w-48 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-4 flex flex-col z-30"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center">
                        <Code2 size={12} className="text-white" />
                      </div>
                      <span className="font-bold text-sm">Linko</span>
                    </div>
                    <div className="bg-[#ffa116] text-black text-xs font-bold text-center py-2 rounded-lg cursor-pointer">
                      Start Session
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View 4: Room */}
        <AnimatePresence>
          {step === 4 && (
            <motion.div 
              className="absolute inset-0 bg-[#0a0a0a] flex"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-1/4 border-r border-white/10 p-4">
                <div className="h-3 bg-white/20 rounded w-1/2 mb-4" />
                <div className="h-2 bg-white/10 rounded w-full mb-2" />
                <div className="h-2 bg-white/10 rounded w-3/4 mb-2" />
              </div>
              <div className="flex-1 border-r border-white/10 p-4">
                <div className="text-[10px] text-[#ffa116] mb-2 font-mono">index.ts</div>
                <div className="text-xs text-green-400 font-mono">console.log("Joined!");</div>
                <div className="inline-block w-[2px] h-[12px] bg-[#ffa116] animate-pulse align-middle ml-1" />
              </div>
              <div className="w-1/4 p-3 flex flex-col gap-2">
                <div className="bg-[#ffa116]/10 border border-[#ffa116]/20 p-2 rounded-lg flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#ffa116] text-black flex items-center justify-center text-[10px] font-bold">U</div>
                  <span className="text-xs text-white">Udhay</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-2 rounded-lg flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">A</div>
                  <span className="text-xs text-white">Ansh</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Mouse Cursor */}
        <motion.div
          className="absolute z-50 text-black dark:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none"
          initial={false}
          animate={{
            x: step === 0 ? "75%" : step === 1 ? "75%" : step === 2 ? "85%" : step === 3 ? "55%" : "40%",
            y: step === 0 ? "40%" : step === 1 ? "10%" : step === 2 ? "-10%" : step === 3 ? "20%" : "30%",
            scale: (step === 1 || step === 3) ? 0.9 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 15,
            mass: 0.5
          }}
        >
          <MousePointer2 size={24} className="fill-black dark:fill-white stroke-white dark:stroke-black stroke-[1.5px]" />
        </motion.div>

      </div>
    </div>
  );
}
