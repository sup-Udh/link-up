"use client";

import { useState } from "react";
import { Code2, ArrowLeft, CheckCircle2, Shield, Copy } from "lucide-react";
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
              Paste this pairing code into your Linko extension. This code expires in 5 minutes.
            </p>

            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center mb-8 group cursor-pointer" onClick={copyToClipboard}>
              <div className="text-4xl font-mono font-bold tracking-[0.2em] text-[#1cbaba] mb-2">
                {pairingCode}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                {copied ? <><CheckCircle2 size={16} className="text-green-500" /> Copied!</> : <><Copy size={16} /> Click to copy</>}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
