"use client";

import { motion, useScroll, useTransform, MotionValue, useSpring } from "framer-motion";
import { Code2, Code, TerminalSquare, BarChart2, ChefHat, Hexagon, Braces } from "lucide-react";

interface PlatformProps {
  progress: MotionValue<number>;
  startX: number;
  startY: number;
  name: string;
  color: string;
  icon: React.ReactNode;
}

function PlatformCard({ progress, startX, startY, name, color, icon }: PlatformProps) {
  // Wait until 10% scroll to start moving, finish moving by 70%
  const x = useTransform(progress, [0.1, 0.4, 0.8], [startX, startX, 0]);
  const y = useTransform(progress, [0.1, 0.4, 0.8], [startY, startY, 0]);
  
  // Dissolve/shrink as it hits the center (70% to 85% scroll)
  const scale = useTransform(progress, [0.75, 0.85], [1, 0.5]);
  const opacity = useTransform(progress, [0.7, 0.85], [1, 0]);
  
  // Subtle rotation effect
  const initialRotate = (startX % 45); // Deterministic pseudo-random rotation
  const rotate = useTransform(progress, [0, 0.8], [initialRotate, 0]);

  return (
    <motion.div
      style={{ x, y, scale, opacity, rotate }}
      className="absolute w-32 h-24 sm:w-48 sm:h-28 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center font-bold text-base sm:text-lg shadow-2xl z-20"
    >
      <div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-900 dark:text-white font-extrabold tracking-tight">{name}</span>
      </div>
    </motion.div>
  );
}

export default function ScrollStory() {
  // Use window scroll progress since this is a global background effect
  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress to create a beautiful, lagging "slow" effect
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 15,
    restDelta: 0.001
  });

  // Linko Center Logo Animations
  const logoScale = useTransform(smoothProgress, [0.4, 0.85], [0.4, 1.2]);
  const logoOpacity = useTransform(smoothProgress, [0, 0.4, 0.85], [0.05, 0.1, 1]);
  const logoGlow = useTransform(
    smoothProgress, 
    [0.6, 0.9], 
    ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 150px rgba(59,130,246,0.8)"]
  );

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      
      {/* Background Grid/Noise for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Central Stage */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        
        {/* Abstract Platform Cards */}
        {/* Pushed further out so they travel more distance and are highly noticeable */}
        <PlatformCard progress={smoothProgress} startX={-600} startY={-400} name="LeetCode" color="#ffa116" icon={<Code size={24} />} />
        <PlatformCard progress={smoothProgress} startX={600} startY={-300} name="HackerRank" color="#00ea64" icon={<TerminalSquare size={24} />} />
        <PlatformCard progress={smoothProgress} startX={-700} startY={350} name="Codeforces" color="#1f8acb" icon={<BarChart2 size={24} />} />
        <PlatformCard progress={smoothProgress} startX={650} startY={450} name="CodeChef" color="#5b3e31" icon={<ChefHat size={24} />} />
        <PlatformCard progress={smoothProgress} startX={-300} startY={550} name="NeetCode" color="#6366f1" icon={<Hexagon size={24} />} />
        <PlatformCard progress={smoothProgress} startX={350} startY={-550} name="GeeksForGeeks" color="#2f8d46" icon={<Braces size={24} />} />

        {/* Central Linko Logo */}
        <motion.div 
          style={{ scale: logoScale, opacity: logoOpacity, boxShadow: logoGlow }}
          className="absolute z-30 w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-blue-600 flex items-center justify-center border border-white/20 shadow-2xl"
        >
          <Code2 size={48} className="text-white sm:w-16 sm:h-16" />
        </motion.div>
        
      </div>

    </div>
  );
}
