"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Users, Code2, Terminal, Shield, Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 7);
    }, 1800);
    return () => clearInterval(timer);
  }, []);
  return (
    <main className="min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden selection:bg-[#ffa116] selection:text-white">
      {/* Dark Top Section with Slanted Bottom */}
      <div className="relative bg-[#282828] text-white pb-32 lg:pb-48" style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)" }}>
        
        {/* Navbar */}
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {/* LeetCode-style Logo Icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ffb84d]">
              <Code2 size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-white">
              Linko
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/get-started" className="text-gray-300 hover:text-white transition-colors">Explore</Link>
            <span className="w-px h-4 bg-gray-600"></span>
            <a href="/login" className="text-gray-300 hover:text-white transition-colors">Sign in</a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Dashboard/Editor Mockup */}
            <div className="relative order-2 lg:order-1 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="rounded-xl bg-white p-2 shadow-2xl overflow-hidden ring-1 ring-black/5">
                {/* Mockup Header */}
                <div className="bg-gray-100 rounded-t-lg p-3 flex gap-2 border-b border-gray-200">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Mockup Content */}
                <div className="bg-white grid grid-cols-[1fr_2fr] h-64 overflow-hidden relative">
                  
                  {/* Left Sidebar Mockup (Problem Description) */}
                  <div className="border-r border-gray-200 p-4 space-y-4 bg-white">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-gray-800 text-sm">1. Two Sum</h3>
                    </div>
                    <div className="flex gap-2">
                       <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">Easy</span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      Given an array of integers <code className="bg-gray-100 px-1 rounded text-gray-700">nums</code> and an integer <code className="bg-gray-100 px-1 rounded text-gray-700">target</code>, return indices of the two numbers such that they add up to <code className="bg-gray-100 px-1 rounded text-gray-700">target</code>.
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      You may assume that each input would have exactly one solution.
                    </p>
                  </div>

                  {/* Right Editor Mockup */}
                  <div className="relative bg-[#1e1e1e] p-4 font-mono text-xs overflow-hidden flex flex-col">
                    
                    {/* Code Area */}
                    <div className="flex-1 space-y-1.5">
                      <div className="text-gray-400">function twoSum(nums, target) {'{'}</div>
                      
                      <div className="pl-4 h-4 flex items-center relative">
                        {step === 0 && <div className="w-1.5 h-4 bg-transparent"></div>}
                        {step === 1 && (
                          <>
                             <div className="text-blue-400">const <span className="text-gray-300">map</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">Map</span>();</div>
                             <div className="h-3 w-0.5 bg-[#1cbaba] ml-1 animate-pulse"></div>
                             <div className="absolute left-[165px] -top-5 px-1 py-0.5 bg-[#1cbaba] text-white rounded text-[8px] font-bold z-10">Udhay</div>
                          </>
                        )}
                        {step >= 2 && <div className="text-blue-400">const <span className="text-gray-300">map</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">Map</span>();</div>}
                      </div>

                      <div className="pl-4 h-4 flex items-center relative">
                        {step === 2 && (
                          <>
                             <div className="text-purple-400">for<span className="text-gray-300">(</span><span className="text-blue-400">let</span> <span className="text-gray-300">i=0; i&lt;nums.length; i++) {'{'}</span></div>
                             <div className="h-3 w-0.5 bg-purple-500 ml-1 animate-pulse"></div>
                             <div className="absolute left-[245px] -top-5 px-1 py-0.5 bg-purple-500 text-white rounded text-[8px] font-bold z-10">Ansh</div>
                          </>
                        )}
                        {step >= 3 && <div className="text-purple-400">for<span className="text-gray-300">(</span><span className="text-blue-400">let</span> <span className="text-gray-300">i=0; i&lt;nums.length; i++) {'{'}</span></div>}
                      </div>

                      <div className="pl-8 h-4 flex items-center relative">
                        {step === 3 && (
                          <>
                             <div className="text-green-500 italic">// Check complement</div>
                             <div className="h-3 w-0.5 bg-purple-500 ml-1 animate-pulse"></div>
                             <div className="absolute left-[130px] -top-5 px-1 py-0.5 bg-purple-500 text-white rounded text-[8px] font-bold z-10">Ansh</div>
                          </>
                        )}
                        {step >= 4 && <div className="text-green-500 italic">// Check complement</div>}
                      </div>

                      <div className="pl-8 h-4 flex items-center relative">
                        {step === 3 && (
                          <>
                             <div className="text-blue-400">const <span className="text-gray-300">diff = target - nums[i];</span></div>
                             <div className="h-3 w-0.5 bg-[#1cbaba] ml-1 animate-pulse"></div>
                             <div className="absolute left-[215px] -top-5 px-1 py-0.5 bg-[#1cbaba] text-white rounded text-[8px] font-bold z-10">Udhay</div>
                          </>
                        )}
                        {step >= 4 && <div className="text-blue-400">const <span className="text-gray-300">diff = target - nums[i];</span></div>}
                      </div>

                      <div className="pl-8 h-4 flex items-center relative">
                        {step === 4 && (
                          <>
                             <div className="text-purple-400">if<span className="text-gray-300">(map.has(diff)) return [map.get(diff), i];</span></div>
                             <div className="h-3 w-0.5 bg-purple-500 ml-1 animate-pulse"></div>
                             <div className="absolute left-[305px] -top-5 px-1 py-0.5 bg-purple-500 text-white rounded text-[8px] font-bold z-10">Ansh</div>
                          </>
                        )}
                        {step >= 5 && <div className="text-purple-400">if<span className="text-gray-300">(map.has(diff)) return [map.get(diff), i];</span></div>}
                      </div>

                      <div className="pl-8 h-4 flex items-center relative">
                        {step === 4 && (
                          <>
                             <div className="text-gray-300">map.set(nums[i], i);</div>
                             <div className="h-3 w-0.5 bg-[#1cbaba] ml-1 animate-pulse"></div>
                             <div className="absolute left-[155px] -top-5 px-1 py-0.5 bg-[#1cbaba] text-white rounded text-[8px] font-bold z-10">Udhay</div>
                          </>
                        )}
                        {step >= 5 && <div className="text-gray-300">map.set(nums[i], i);</div>}
                      </div>

                      {step >= 2 && <div className="pl-4 text-gray-300 h-4">{'}'}</div>}
                      <div className="text-gray-400 h-4">{'}'}</div>
                    </div>

                    {/* Terminal Slider */}
                    <div className={`absolute bottom-0 left-0 right-0 bg-[#252526] border-t border-gray-700 transition-all duration-500 ease-in-out flex flex-col ${step >= 5 ? 'h-24' : 'h-0 border-transparent opacity-0'}`}>
                      {step >= 5 && (
                         <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-700 bg-[#2d2d2d]">
                           <span className="text-gray-300 font-semibold text-[10px]">Test Results</span>
                           <div className="flex gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-gray-500/80"></div>
                           </div>
                         </div>
                      )}
                      
                      <div className="p-4 flex-1 flex flex-col justify-center bg-[#1e1e1e]">
                         {step === 5 && (
                           <div className="flex items-center gap-3 text-yellow-400/90 font-medium text-xs">
                             <div className="animate-spin w-3.5 h-3.5 border-[2px] border-yellow-400/90 border-t-transparent rounded-full"></div>
                             <span>Running 3 Test Cases...</span>
                           </div>
                         )}
                         {step === 6 && (
                           <div className="space-y-1">
                             <div className="text-green-500 font-bold text-sm flex items-center gap-1.5">
                               <span className="text-lg leading-none">✓</span> Accepted
                             </div>
                             <div className="text-gray-400 text-[10px] font-medium">Runtime: 52 ms • Memory: 42.1 MB</div>
                           </div>
                         )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                A New Way to Code
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 font-light">
                Linko is the best platform to help you enhance your skills, expand your knowledge and prepare for technical interviews with real-time multiplayer collaboration.
              </p>
              
              <Link href="/room" className="inline-flex items-center gap-2 bg-[#1cbaba] hover:bg-[#19a6a6] text-white px-8 py-3.5 rounded-full font-semibold transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#1cbaba]/20">
                Create Session <ArrowRight size={18} />
              </Link>
            </div>
            
          </div>
        </div>
      </div>

      {/* Light Bottom Section */}
      <div className="relative -mt-20 z-0 bg-white">
        
        {/* Meet the Developers Section */}
        <section className="mx-auto max-w-7xl px-6 pt-24 lg:pt-32 pb-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 text-blue-500 mb-6">
              <Users size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet the Developers</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">
              The minds behind Linko. We built this platform because we believe collaborative coding should be accessible, fast, and completely seamless.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Developer 1: Udhay */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-10 flex flex-col items-center text-center hover:shadow-2xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 z-0"></div>
              <div className="w-32 h-32 rounded-full bg-gray-100 mb-6 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                {/* PFP Placeholder */}
                <span className="text-gray-400 font-semibold text-sm">PFP Here</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1 relative z-10">Udhay</h3>
              <p className="text-blue-500 font-semibold text-sm tracking-wide uppercase mb-8 relative z-10">Co-Founder & Engineer</p>
              <div className="relative z-10 flex-1 flex items-center">
                <span className="absolute -top-6 -left-2 text-6xl text-gray-100 font-serif">"</span>
                <p className="text-gray-600 italic relative z-10 leading-relaxed">
                  [Your thoughts and quotes go here. Write about your vision for the platform, the technical challenges you enjoyed solving, or your message to the community.]
                </p>
              </div>
            </div>

            {/* Developer 2: Ansh */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-10 flex flex-col items-center text-center hover:shadow-2xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-50 to-amber-50 z-0"></div>
              <div className="w-32 h-32 rounded-full bg-gray-100 mb-6 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                {/* PFP Placeholder */}
                <span className="text-gray-400 font-semibold text-sm">PFP Here</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1 relative z-10">Ansh</h3>
              <p className="text-[#ffa116] font-semibold text-sm tracking-wide uppercase mb-8 relative z-10">Co-Founder & Engineer</p>
              <div className="relative z-10 flex-1 flex items-center">
                <span className="absolute -top-6 -left-2 text-6xl text-gray-100 font-serif">"</span>
                <p className="text-gray-600 italic relative z-10 leading-relaxed">
                  [Your thoughts and quotes go here. Share what inspired you to build Linko, the impact you hope it has, or your favorite feature of the product.]
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Start Exploring Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 lg:py-24 border-t border-gray-100 mt-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Text */}
            <div className="text-center lg:text-right order-2 lg:order-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#1cbaba]/10 text-[#1cbaba] mb-6">
                <Terminal size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1cbaba] mb-6">
                Start Exploring
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8 max-w-md ml-auto mr-auto lg:mr-0 text-lg font-light">
                Explore a well-organized tool that helps you get the most out of your practice by providing a shared structure to guide your progress towards the next step in your programming career.
              </p>
              <Link href="/get-started" className="inline-flex items-center gap-1 text-[#1cbaba] font-semibold hover:text-[#19a6a6] transition-colors">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right: Floating Cards */}
            <div className="relative h-[400px] order-1 lg:order-2 flex justify-center lg:justify-start items-center">
              {/* Back Card */}
              <div className="absolute w-64 h-80 bg-orange-100 rounded-2xl shadow-xl transform -rotate-6 -translate-x-12 translate-y-4 border border-orange-200">
                <div className="h-1/3 bg-orange-200/50 rounded-t-2xl"></div>
              </div>
              {/* Middle Card */}
              <div className="absolute w-64 h-80 bg-green-100 rounded-2xl shadow-xl transform -rotate-3 -translate-x-4 border border-green-200 z-10">
                <div className="h-1/3 bg-green-200/50 rounded-t-2xl"></div>
              </div>
              {/* Front Card */}
              <div className="absolute w-72 h-80 bg-[#1cbaba] rounded-2xl shadow-2xl transform translate-x-8 -translate-y-4 z-20 flex flex-col">
                <div className="p-4 border-b border-white/20">
                  <div className="h-3 w-1/3 bg-white/30 rounded mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-1/4 bg-white/20 rounded"></div>
                    <div className="h-6 w-1/2 bg-white/20 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-[#1cbaba]">
                    <Play fill="currentColor" size={24} className="ml-1" />
                  </div>
                </div>
                <div className="p-4 bg-white rounded-b-2xl h-16 flex items-center">
                  <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
          </div>
        </section>



        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Code2 size={24} className="text-[#ffa116]" />
              <span className="font-bold text-gray-900 text-xl">Linko</span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Help Center</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            </div>

            <div className="text-sm text-gray-400">
              Made by Udhay & Ansh · © 2026
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
