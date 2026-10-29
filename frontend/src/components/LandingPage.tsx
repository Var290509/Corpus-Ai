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
  Cloud,
  AlertCircle
} from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';
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
  const [authError, setAuthError] = useState<string | null>(null);

  // Online / Connection Status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

      tl.fromTo('.landing-nav', 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, delay: 0.1 }
      );

      tl.fromTo('.landing-badge', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5 }, 
        '-=0.3'
      );

      if (headingWordsRef.current.length > 0) {
        tl.fromTo(headingWordsRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'back.out(1.2)' },
          '-=0.2'
        );
      }

      if (sublineWordsRef.current.length > 0) {
        tl.fromTo(sublineWordsRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.02, duration: 0.5 },
          '-=0.3'
        );
      }

      tl.fromTo('.landing-cta-group',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.2'
      );

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
    setAuthError(null);

    if (isSignUp) {
      const result = authService.signUp(name, email, password);
      if (result.error) {
        setAuthError(result.error);
        return;
      }
      if (result.user) {
        onLogin(result.user);
      }
    } else {
      const result = authService.logIn(email, password);
      if (result.error) {
        setAuthError(result.error);
        return;
      }
      if (result.user) {
        onLogin(result.user);
      }
    }
  };

  const handleQuickDemoLogin = () => {
    const result = authService.logIn('demo@corpus.ai', 'Password123!');
    if (result.user) {
      onLogin(result.user);
    } else {
      onLogin({
        id: 'usr-demo',
        name: 'Dr. Lead Investigator',
        email: 'demo@corpus.ai'
      });
    }
  };

  return (
    <div ref={heroRef} className="min-h-screen flex flex-col font-sans bg-[#13091F]/30 backdrop-blur-[1px] text-[#FAF5FF] relative overflow-hidden">
      
      {/* 1. Fluid simulation canvas (z-0) */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0 pointer-events-auto opacity-70"
        aria-hidden="true"
      />

      {/* 2. Soft Scrim for legibility (cosmic nebula vignette) */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none" 
        style={{
          background: 'radial-gradient(115% 95% at 50% 46%, rgba(19, 9, 31, 0.35) 0%, rgba(15, 7, 24, 0.60) 50%, rgba(10, 4, 18, 0.82) 100%)'
        }}
        aria-hidden="true"
      />

      {/* 3. Top Navbar (z-20) */}
      <header className="landing-nav sticky top-0 z-30 w-full border-b border-[#D4C4E2]/20 bg-[#13091F]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#24143D] to-[#43226D] flex items-center justify-center shadow-lg border border-[#D4C4E2]/30 text-white font-bold font-mono">
                C
              </div>
              <div className="flex items-center">
                <span className="font-extrabold text-base tracking-tight text-[#FAF5FF]">
                  CORPUS <span className="text-[#D4C4E2] font-light">AI</span>
                </span>
                <span className="ml-2.5 hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#24143D] text-[#D4C4E2] border border-[#D4C4E2]/25">
                  Autonomous Agentic RAG
                </span>
              </div>
            </div>

            {/* Cloud Status & Auth Actions */}
            <div className="flex items-center space-x-3">
              <div 
                className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#24143D] text-xs font-medium shadow-sm transition-all ${
                  isOnline 
                    ? 'border border-emerald-400/40 text-emerald-200' 
                    : 'border border-rose-500/40 text-rose-300'
                }`}
                title={isOnline ? "System Status: Online" : "System Status: Offline"}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              <button
                onClick={() => { setIsSignUp(false); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#FAF5FF] hover:text-white hover:bg-[#24143D] transition-all cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={handleQuickDemoLogin}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF5FF] hover:bg-white text-[#13091F] shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 4. Center Hero Column (z-10) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex flex-col items-center text-center relative z-10">
        
        {/* Badge Pill */}
        <div className="landing-badge inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#24143D]/85 border border-[#D4C4E2]/25 text-[#D4C4E2] text-xs font-medium backdrop-blur-md shadow-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#FAF5FF]" />
          <span>Next-Generation Systematic Review & Multi-Index Recommender</span>
        </div>

        {/* Word-by-Word Revealed Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#FAF5FF] tracking-tight max-w-4xl leading-[1.12]">
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
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-[#FAF5FF] max-w-2xl leading-relaxed opacity-90">
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

        {/* Clean CTA Group (Image 1 email input removed!) */}
        <div className="landing-cta-group mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={handleQuickDemoLogin}
            className="px-7 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FAF5FF] to-[#D4C4E2] text-[#13091F] hover:brightness-105 shadow-xl flex items-center space-x-2 cursor-pointer transition-all"
          >
            <span>Launch Review Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setIsSignUp(true); setShowAuthModal(true); }}
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#24143D]/80 text-[#FAF5FF] border border-[#D4C4E2]/30 hover:bg-[#381F5C] hover:border-[#D4C4E2]/50 shadow-md flex items-center space-x-2 cursor-pointer transition-all"
          >
            <User className="w-4 h-4 text-[#D4C4E2]" />
            <span>Create Account / Sign In</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-left">
          
          <div className="landing-feature-card glass-panel rounded-2xl p-5 border border-[#D4C4E2]/20 space-y-2 hover:border-[#D4C4E2]/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#2B1544] text-[#D4C4E2] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF5FF]">Autonomous Agentic RAG</h3>
            <p className="text-xs text-[#FAF5FF]/80 leading-relaxed">
              Reads the full text of thousands of research papers, identifies consensus versus contradictions, and provides quotation evidence.
            </p>
          </div>

          <div className="landing-feature-card glass-panel rounded-2xl p-5 border border-[#D4C4E2]/20 space-y-2 hover:border-[#D4C4E2]/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#2B1544] text-amber-300 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF5FF]">Multi-Database Discovery</h3>
            <p className="text-xs text-[#FAF5FF]/80 leading-relaxed">
              Autonomous recommender queries Scopus, Web of Science, PubMed/MEDLINE, and IEEE Xplore Digital Library based on your papers.
            </p>
          </div>

          <div className="landing-feature-card glass-panel rounded-2xl p-5 border border-[#D4C4E2]/20 space-y-2 hover:border-[#D4C4E2]/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#2B1544] text-emerald-300 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#FAF5FF]">Cloud Sync & Persistence</h3>
            <p className="text-xs text-[#FAF5FF]/80 leading-relaxed">
              Real-time cloud persistence with offline-first synchronization and audit logging.
            </p>
          </div>

        </div>

      </main>

      {/* Footer (z-20) */}
      <footer className="border-t border-[#D4C4E2]/15 bg-[#13091F]/90 py-6 text-center text-xs text-[#FAF5FF]/70 relative z-20">
        © 2026 Corpus AI — Autonomous Systematic Literature Review & Agentic RAG Platform.
      </footer>

      {/* Auth Modal (Sign In / Sign Up) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            ref={authModalRef}
            className="w-full max-w-md bg-[#13091F] border border-[#D4C4E2]/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1 pb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2E1945] to-[#9E88BE] flex items-center justify-center mx-auto text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FAF5FF]">
                {isSignUp ? 'Create Corpus AI Account' : 'Sign In to Review Workspace'}
              </h3>
              <p className="text-xs text-[#FAF5FF]/80">
                {isSignUp 
                  ? 'Access multi-database screening and agentic synthesis'
                  : 'Welcome back! Enter your research credentials'}
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500/70 text-rose-200 text-xs flex items-center space-x-2 animate-fade-in shadow-md">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-[#FAF5FF] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setAuthError(null); }}
                    placeholder="Dr. Eleanor Vance"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-[#FAF5FF]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#FAF5FF] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                  placeholder="researcher@university.edu"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-[#FAF5FF]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#FAF5FF]">Password</label>
                  <span className="text-[10px] text-[#FAF5FF]/60">min 6 characters</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-[#FAF5FF]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-[#FAF5FF] text-[#13091F] hover:bg-white shadow-md transition-all cursor-pointer mt-2"
              >
                {isSignUp ? 'Create Free Account' : 'Sign In to Workspace'}
              </button>
            </form>

            {/* Quick Demo Credentials Pill */}
            {!isSignUp && (
              <div className="p-2 rounded-xl bg-[#13091F]/90 border border-[#D4C4E2]/15 text-[11px] text-[#FAF5FF]/70 flex items-center justify-between">
                <span>Demo: <strong className="text-[#FAF5FF]">demo@corpus.ai</strong></span>
                <span>Pass: <strong className="text-[#FAF5FF]">Password123!</strong></span>
              </div>
            )}

            <div className="pt-2 border-t border-[#D4C4E2]/15 flex items-center justify-between text-xs text-[#FAF5FF]/80">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="hover:text-white transition-colors cursor-pointer text-[#D4C4E2]"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                }}
                className="hover:text-white transition-colors cursor-pointer"
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

function initFluidSimulation(canvas: HTMLCanvasElement): () => void {
  canvas.width = canvas.clientWidth || window.innerWidth;
  canvas.height = canvas.clientHeight || window.innerHeight;

  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return () => {};

  let animationFrameId = 0;

  const render = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.20, 0.13, 0.09, 1.0); // Warm medium coffee clear color
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
