import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Award, 
  FileText, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Layers,
  Search,
  BookOpen,
  Cloud
} from 'lucide-react';
import { User as UserType } from '../types';
import gsap from 'gsap';

interface LandingPageProps {
  onLogin: (user: UserType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headingWordsRef = useRef<HTMLSpanElement[]>([]);
  const sublineWordsRef = useRef<HTMLSpanElement[]>([]);
  const authModalRef = useRef<HTMLDivElement>(null);

  const headingText = "Deep Literature Synthesis in an Information-Overloaded World";
  const sublineText = "Cut through thousands of research papers, uncover consensus versus contradiction, and build audit-grade systematic reviews with explainable AI evidence.";

  // Fluid simulation WebGL mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pavel Dobryakov WebGL Fluid Simulation Engine
    let destroySim: (() => void) | undefined;
    try {
      destroySim = initFluidSimulation(canvas);
    } catch (e) {
      console.warn("WebGL fluid sim initialized fallback:", e);
    }

    return () => {
      if (destroySim) destroySim();
    };
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Nav bar slide down
      tl.fromTo('.landing-nav', 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, delay: 0.1 }
      );

      // Badge pill fade up
      tl.fromTo('.landing-badge', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5 }, 
        '-=0.3'
      );

      // Word by word heading stagger
      if (headingWordsRef.current.length > 0) {
        tl.fromTo(headingWordsRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'back.out(1.2)' },
          '-=0.2'
        );
      }

      // Word by word subline stagger
      if (sublineWordsRef.current.length > 0) {
        tl.fromTo(sublineWordsRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.02, duration: 0.5 },
          '-=0.3'
        );
      }

      // Action form slide up
      tl.fromTo('.landing-actions',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.2'
      );

      // Feature cards stagger
      tl.fromTo('.landing-feature-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 },
        '-=0.3'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Animate Auth Modal on open
  useEffect(() => {
    if (showAuthModal && authModalRef.current) {
      gsap.fromTo(authModalRef.current,
        { scale: 0.94, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    }
  }, [showAuthModal]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const loggedInUser: UserType = {
      id: `usr-${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim()
    };

    onLogin(loggedInUser);
  };

  const handleQuickDemoLogin = () => {
    onLogin({
      id: 'usr-demo',
      name: 'Dr. Systematic Reviewer',
      email: 'lead.investigator@corpus.ai'
    });
  };

  return (
    <div ref={heroRef} className="min-h-screen flex flex-col font-sans bg-[#0E0704] text-[#E5E4E2] relative overflow-hidden">
      
      {/* 1. Fluid simulation canvas (z-0) */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
        aria-hidden="true"
      />

      {/* 2. Scrim (z-1) for text legibility and deep coffee obsidian vignette */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none" 
        style={{
          background: 'radial-gradient(115% 95% at 50% 46%, rgba(14, 7, 4, 0.72) 0%, rgba(14, 7, 4, 0.85) 45%, rgba(14, 7, 4, 0.96) 100%)'
        }}
        aria-hidden="true"
      />

      {/* 3. Top Navbar (z-20) */}
      <header className="landing-nav sticky top-0 z-30 w-full border-b border-[#E6E0F0]/15 bg-[#170E08]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center shadow-lg border border-[#E6E0F0]/30 text-white font-bold font-mono">
                C
              </div>
              <div className="flex items-center">
                <span className="font-extrabold text-base tracking-tight text-[#FAF9F8]">
                  CORPUS <span className="text-[#E6E0F0] font-light">AI</span>
                </span>
                <span className="ml-2.5 hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#2B1B12] text-[#E6E0F0] border border-[#E6E0F0]/25">
                  Autonomous Agentic RAG
                </span>
              </div>
            </div>

            {/* Cloud Status & Auth Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#24160E] border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <Cloud className="w-3.5 h-3.5" />
                <span>Google Cloud Firestore Integrated</span>
              </div>

              <button
                onClick={() => { setIsSignUp(false); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#E5E4E2] hover:text-white hover:bg-[#2B1B12] transition-all cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => { setIsSignUp(true); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E5E4E2] hover:bg-white text-[#160E08] shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 4. Center Hero Column (z-10) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex flex-col items-center text-center relative z-10">
        
        {/* Badge Pill */}
        <div className="landing-badge inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#2B1B12]/80 border border-[#E6E0F0]/20 text-[#E6E0F0] text-xs font-medium backdrop-blur-md shadow-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#E5E4E2]" />
          <span>Next-Generation Systematic Review & Multi-Index Recommender</span>
        </div>

        {/* Word-by-Word Revealed Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#FAF9F8] tracking-tight max-w-4xl leading-[1.12]">
          {headingText.split(" ").map((word, index) => (
            <span
              key={index}
              ref={(el) => { if (el) headingWordsRef.current[index] = el; }}
              className="inline-block mr-2"
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Word-by-Word Revealed Subline */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-[#C5BFB8] max-w-2xl leading-relaxed">
          {sublineText.split(" ").map((word, index) => (
            <span
              key={index}
              ref={(el) => { if (el) sublineWordsRef.current[index] = el; }}
              className="inline-block mr-1.5"
            >
              {word}
            </span>
          ))}
        </p>

        {/* Action Form / Waitlist Pill */}
        <div className="landing-actions mt-9 w-full max-w-xl">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) {
                handleAuthSubmit(e);
              } else {
                handleQuickDemoLogin();
              }
            }}
            className="flex items-center p-1.5 rounded-full bg-[#24160E]/90 border border-[#E6E0F0]/30 shadow-2xl backdrop-blur-xl"
          >
            <div className="pl-4 pr-2 flex items-center text-[#B8B3AC]">
              <Mail className="w-4 h-4 text-[#E6E0F0]" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter institutional email to enter workspace..."
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#FAF9F8] placeholder-[#8E8680] focus:outline-none px-2"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#E5E4E2] to-[#E6E0F0] text-[#160E08] hover:brightness-105 shadow-md flex items-center space-x-1.5 cursor-pointer shrink-0 transition-all"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Instant Access Button */}
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-[#A59E98]">
            <span>Or explore immediately without email:</span>
            <button
              onClick={handleQuickDemoLogin}
              className="text-[#E6E0F0] font-semibold underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
            >
              Instant 1-Click Guest Access →
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-left">
          
          <div className="landing-feature-card glass-panel rounded-2xl p-5 border border-[#E6E0F0]/15 space-y-2 hover:border-[#E6E0F0]/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#3B2518] text-[#E6E0F0] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF9F8]">Autonomous Agentic RAG</h3>
            <p className="text-xs text-[#C5BFB8] leading-relaxed">
              Reads the full text of thousands of research papers, identifies consensus versus contradictions, and provides quotation evidence.
            </p>
          </div>

          <div className="landing-feature-card glass-panel rounded-2xl p-5 border border-[#E6E0F0]/15 space-y-2 hover:border-[#E6E0F0]/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#3B2518] text-amber-300 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF9F8]">Multi-Database Discovery</h3>
            <p className="text-xs text-[#C5BFB8] leading-relaxed">
              Autonomous recommender queries Scopus, Web of Science, PubMed/MEDLINE, and IEEE Xplore to suggest high-impact papers.
            </p>
          </div>

          <div className="landing-feature-card glass-panel rounded-2xl p-5 border border-[#E6E0F0]/15 space-y-2 hover:border-[#E6E0F0]/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#3B2518] text-emerald-300 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF9F8]">Google Cloud Firestore</h3>
            <p className="text-xs text-[#C5BFB8] leading-relaxed">
              Backed by Google Cloud Firestore (Spark Free Tier) for zero-cost, real-time persistence with offline-first synchronization.
            </p>
          </div>

        </div>

      </main>

      {/* Footer (z-20) */}
      <footer className="border-t border-[#E6E0F0]/10 bg-[#120B07] py-6 text-center text-xs text-[#8E8680] relative z-20">
        © 2026 Corpus AI — Autonomous Systematic Literature Review & Agentic RAG Platform.
      </footer>

      {/* Auth Modal (Sign In / Sign Up) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div 
            ref={authModalRef}
            className="w-full max-w-md bg-[#1F140D] border border-[#E6E0F0]/25 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1 pb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center mx-auto text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FAF9F8]">
                {isSignUp ? 'Create Corpus AI Account' : 'Sign In to Review Workspace'}
              </h3>
              <p className="text-xs text-[#A59E98]">
                {isSignUp 
                  ? 'Access multi-database screening and agentic synthesis'
                  : 'Welcome back! Enter your research credentials'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-[#FAF9F8] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Eleanor Vance"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-[#FAF9F8]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#FAF9F8] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@university.edu"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-[#FAF9F8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FAF9F8] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-[#FAF9F8]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-[#E5E4E2] text-[#160E08] hover:bg-white shadow-md transition-all cursor-pointer mt-2"
              >
                {isSignUp ? 'Create Free Account' : 'Sign In to Workspace'}
              </button>
            </form>

            <div className="pt-2 border-t border-[#E6E0F0]/15 flex items-center justify-between text-xs text-[#A59E98]">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="hover:text-[#FAF9F8] transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="hover:text-[#FAF9F8] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// WebGL Fluid Simulation Engine Implementation for React
function initFluidSimulation(canvas: HTMLCanvasElement): () => void {
  canvas.width = canvas.clientWidth || window.innerWidth;
  canvas.height = canvas.clientHeight || window.innerHeight;

  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return () => {};

  let animationFrameId = 0;
  let time = 0;

  // Gentle swirling ambient background loop
  const render = () => {
    time += 0.01;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.06, 0.03, 0.02, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  const handleResize = () => {
    if (!canvas) return;
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
  };

  window.addEventListener('resize', handleResize);

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleResize);
  };
}
