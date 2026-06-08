"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, Lock, Eye, Terminal, Users, Info, Scale } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type Tab = "terms" | "privacy";

export default function TermsAndPrivacy() {
  const [activeTab, setActiveTab] = useState<Tab>("terms");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "privacy") {
        setActiveTab("privacy");
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 transition-colors duration-300 relative overflow-hidden pb-16">
      
      {/* Background Gradients for Premium Look */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ffa116]/5 dark:bg-[#ffa116]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1cbaba]/5 dark:bg-[#1cbaba]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40 z-0" />

      {/* Top Header/Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium text-sm">Back to Login</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Page Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10">
        
        {/* Title Block */}
        <div className="text-center md:text-left mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-4 border border-orange-200 dark:border-orange-500/20">
            <Shield size={14} className="shrink-0" />
            <span>Legal Agreement & Security</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            Legal Terms & Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl">
            Please read our Terms of Service and Privacy Policy to understand how your collaboration sessions, code sandbox, and account details are managed.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 dark:border-white/10 mb-8 gap-6">
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-2 pb-4 text-base font-semibold border-b-2 transition-all relative ${
              activeTab === "terms"
                ? "border-[#ffa116] text-[#ffa116] dark:text-[#ffb84d]"
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <FileText size={18} />
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 pb-4 text-base font-semibold border-b-2 transition-all relative ${
              activeTab === "privacy"
                ? "border-[#ffa116] text-[#ffa116] dark:text-[#ffb84d]"
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Lock size={18} />
            Privacy Policy
          </button>
        </div>

        {/* Legal Text Sections */}
        <div className="bg-white/70 dark:bg-[#111]/70 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm transition-colors duration-300">
          {activeTab === "terms" ? (
            <div className="space-y-8 prose prose-gray dark:prose-invert max-w-none">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 dark:text-gray-500 pb-4 border-b border-gray-100 dark:border-white/5">
                <span className="flex items-center gap-1"><Scale size={14} /> Linko Legal Guidelines</span>
                <span>•</span>
                <span>Last Updated: June 5, 2026</span>
              </div>

              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">1.</span> Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  By signing up, logging into, or using Linko (referred to as the "Platform," "Service," or "Linko"), you agree to be bound by these Terms of Service. If you do not agree, you must immediately cease using the platform.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">2.</span> Collaborative Editor & Sandbox Code Execution
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  Linko provides a real-time collaborative coding workspace equipped with multi-language code editors and dynamic sandbox code execution. You agree to use the workspace resources responsibly:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li><strong>Executable Limits:</strong> You agree not to run malicious code, denial of service scripts, infinite loop payloads, or server-intrusive operations inside the compilation sandbox.</li>
                  <li><strong>Editor Respect:</strong> Collaborative workspaces allow shared control. You agree not to disrupt or lock other users out of active rooms unless acting in a legitimate administrative capacity (e.g., Room Host roles).</li>
                  <li><strong>Sharing & Invites:</strong> You are solely responsible for whom you share your Room invitation link with. Linko is not liable for deletions, edits, or overrides made to your code by room participants.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">3.</span> Room Ownership and Hosting
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  Every multiplayer coding room is associated with a Host. The Host possesses administrative capabilities, including the ability to lock/unlock editing access, assign driver tokens, require user join approvals, and kick participants. Host actions are final, and Linko will not intervene in disputes concerning room control.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">4.</span> Intellectual Property & Code Ownership
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  You retain complete intellectual property ownership over the code you write and publish on Linko. By inviting other users into your room, you grant them a temporary license to view, edit, and run your code within that active collaborative session.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">5.</span> Platform Moderation & Account Termination
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  We reserve the right to suspend accounts, terminate active multiplayer connections, and delete persisted rooms that violate guidelines, abuse sandboxed resources, or engage in unauthorized scraping/attacks on Linko services.
                </p>
              </section>

            </div>
          ) : (
            <div className="space-y-8 prose prose-gray dark:prose-invert max-w-none">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 dark:text-gray-500 pb-4 border-b border-gray-100 dark:border-white/5">
                <span className="flex items-center gap-1"><Eye size={14} /> Data Transparency & Privacy</span>
                <span>•</span>
                <span>Last Updated: June 5, 2026</span>
              </div>

              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">1.</span> Information We Collect
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  We collect user data to offer seamless real-time syncing and accurate collaborative stats:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/5 flex gap-3">
                    <Users size={20} className="text-orange-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Profile Details</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We sync your login information, display name, custom bio, and profile/banner picture URL.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/5 flex gap-3">
                    <Terminal size={20} className="text-[#1cbaba] shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Room activity & Code</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We temporarily store active collaborative code buffers and execute them in our compilation sandbox.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">2.</span> Time Collaborating Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  To provide you with high-fidelity analytics on your developer profile, we log timestamps:
                </p>
                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3">
                  <Info size={20} className="text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    When you enter a room, the multiplayer WebSocket logs your <code>joined_at</code> timestamp. When you exit or disconnect, it logs the <code>left_at</code> timestamp. These sessions are combined to display your exact time spent collaborating on your profile metrics.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">3.</span> How We Use and Share Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  Your profile details (such as your display name and profile picture) are visible to other participants who join the same multiplayer coding room. We do not sell or license your personal information, profile stats, or code data to any third-party marketing companies. All data is processed using secure cloud databases (Supabase).
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ffa116]">4.</span> Cookie Settings & Browser LocalStorage
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  We use cookies and local browser storage (such as <code>localStorage</code>) to keep you logged in, persist your selected workspace code language, and remember guest usernames when accessing developer workspace links.
                </p>
              </section>

            </div>
          )}
        </div>

      </div>
    </main>
  );
}
