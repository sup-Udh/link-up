import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Code2 size={24} className="text-[#ffa116]" />
          <span className="font-bold text-gray-900 dark:text-white text-xl transition-colors">Linko</span>
        </div>
        
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400 transition-colors">
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
        </div>

        <div className="text-sm text-gray-400">
          Made by ❤️ Udhay & Ansh · © 2026
        </div>
      </div>
    </footer>
  );
}
