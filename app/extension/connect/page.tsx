"use client";

import { useState } from "react";
import { Code2, ArrowLeft, CheckCircle2, Shield, Copy, Puzzle, MousePointerClick, ClipboardPaste } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function ConnectExtension() {
  const [loading, setLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Code generation")
      const response = await fetch('/api/extension/code', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to generate code');
      
      setPairingCode(data.code);
      setExpiresAt(data.expiresAt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 p-6">
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group font-medium">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
      </div>

      <div className="absolute top-6 right-6 md:top-8 md:right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#1cbaba]/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex justify-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ffb84d] flex items-center justify-center shadow-lg shadow-[#ffa116]/20">
            <Code2 size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Connect Extension</h1>
        
        {!pairingCode ? (
          <>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
              The Linko Chrome extension is requesting access to your account. Authorize it to enable collaborative coding on LeetCode.
            </p>

            <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 border border-gray-200 dark:border-gray-800 mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">This will allow the extension to create rooms and collaborate on your behalf.</p>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

            <button 
              onClick={generateCode}
              disabled={loading}
              className="w-full bg-[#1cbaba] hover:bg-[#19a6a6] text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
            >
              {loading ? 'Generating...' : 'Authorize Extension'}
            </button>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Copy your pairing code below. This code expires in 5 minutes.
            </p>

            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center mb-8 group cursor-pointer hover:border-[#1cbaba]/50 transition-colors shadow-sm hover:shadow-[#1cbaba]/10" onClick={copyToClipboard}>
              <div className="text-4xl font-mono font-bold tracking-[0.2em] text-[#1cbaba] mb-2">
                {pairingCode}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                {copied ? <><CheckCircle2 size={16} className="text-green-500" /> Copied!</> : <><Copy size={16} /> Click to copy</>}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-150">
              <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 text-center">How to Connect</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#1cbaba]/10 flex items-center justify-center shrink-0 border border-[#1cbaba]/20 shadow-[0_0_10px_rgba(28,186,186,0.1)]">
                    <Puzzle size={18} className="text-[#1cbaba]" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">1. Open the Extension</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Click the Linko icon in your browser's toolbar (you may need to pin it first).</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#ffa116]/10 flex items-center justify-center shrink-0 border border-[#ffa116]/20 shadow-[0_0_10px_rgba(255,161,22,0.1)]">
                    <MousePointerClick size={18} className="text-[#ffa116]" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">2. Choose Enter Pairing Code</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Click the primary button inside the extension popup.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                    <ClipboardPaste size={18} className="text-green-500" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">3. Paste & Verify</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Paste the code from above into the input field and click Verify Code.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
