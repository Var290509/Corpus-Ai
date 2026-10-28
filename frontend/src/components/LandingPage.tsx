import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { User as UserType } from '../types';

interface LandingPageProps {
  onLogin: (user: UserType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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
      name: 'Dr. Researcher',
      email: 'researcher@corpus.ai'
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#F5F4F2] via-[#EBE9E6] to-[#ECE7F4] text-[#2D2521] relative overflow-hidden">
      
      {/* Background ambient glass spheres */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#E6E0F0]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#6F4E37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-[#FAF9FD]/80 rounded-full blur-2xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#E6E0F0] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#8A5F40] flex items-center justify-center shadow-md shadow-[#6F4E37]/20 border border-[#E6E0F0]">
                <span className="text-[#E6E0F0] font-bold text-xl font-mono">C</span>
              </div>
              <div>
                <span className="font-semibold text-lg tracking-tight text-[#462E1E]">Corpus AI</span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E6E0F0] text-[#5A3D29] border border-[#d4c8e4]">
                  Autonomous Agent
                </span>
              </div>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setIsSignUp(false); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A3D29] hover:text-[#462E1E] hover:bg-white/60 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6F4E37] hover:bg-[#5A3D29] text-white shadow-md shadow-[#6F4E37]/20 transition-all flex items-center space-x-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center text-center relative z-10">
        
        {/* Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E6E0F0] text-xs text-[#5A3D29] shadow-glass-subtle mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-[#6F4E37]" />
          <span>Next-Generation Systematic Literature Review & Agentic RAG</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2D2521] max-w-4xl leading-[1.15]">
          Autonomous Research Synthesis with <span className="text-[#6F4E37]">Corpus AI</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-[#5F5C56] max-w-2xl leading-relaxed">
          Screen, synthesize, and extract deep evidence from more than 1,000 research papers. 
          Powered by an autonomous Agentic RAG engine with explainable AI badges, automated PICO tagging, 
          and human-in-the-loop decision protection.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => { setIsSignUp(true); setShowAuthModal(true); }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-[#6F4E37] hover:bg-[#5A3D29] text-white shadow-lg shadow-[#6F4E37]/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>Create New Review Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleQuickDemoLogin}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-white/80 hover:bg-white text-[#5A3D29] border border-[#E6E0F0] shadow-sm transition-all"
          >
            Instant Guest Access &rarr;
          </button>
        </div>

        {/* Value Prop Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          <div className="glass-card rounded-2xl p-6 border border-[#E6E0F0]">
            <div className="w-10 h-10 rounded-xl bg-[#E6E0F0] flex items-center justify-center text-[#5A3D29] mb-4">
              <Cpu className="w-5 h-5 text-[#6F4E37]" />
            </div>
            <h3 className="font-semibold text-sm text-[#462E1E]">Autonomous Agentic RAG</h3>
            <p className="text-xs text-[#5F5C56] mt-1.5 leading-relaxed">
              Reads the total text across 1,000+ papers, extracts quantitative study metrics ($N$, HR, $p$), and detects consensus vs. contradictory findings.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-[#E6E0F0]">
            <div className="w-10 h-10 rounded-xl bg-[#E6E0F0] flex items-center justify-center text-[#5A3D29] mb-4">
              <Award className="w-5 h-5 text-[#6F4E37]" />
            </div>
            <h3 className="font-semibold text-sm text-[#462E1E]">Explainable AI Badges</h3>
            <p className="text-xs text-[#5F5C56] mt-1.5 leading-relaxed">
              Awards Gold Standard RCT, High Power, and Risk-of-Bias badges with strict citation rationales explaining exactly why each badge was given.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-[#E6E0F0]">
            <div className="w-10 h-10 rounded-xl bg-[#E6E0F0] flex items-center justify-center text-[#5A3D29] mb-4">
              <Layers className="w-5 h-5 text-[#6F4E37]" />
            </div>
            <h3 className="font-semibold text-sm text-[#462E1E]">Universal File Ingestion</h3>
            <p className="text-xs text-[#5F5C56] mt-1.5 leading-relaxed">
              Upload your own research papers via RIS, CSV, JSON, BibTeX, or fetch live studies directly from PubMed & Europe PMC APIs.
            </p>
          </div>

        </div>

      </main>

      {/* Auth Modal (Sign In / Sign Up) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in text-left">
          <div 
            className="w-full max-w-md glass-panel-elevated rounded-2xl border border-[#E6E0F0] shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0F0]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6F4E37] flex items-center justify-center text-white">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#462E1E]">
                    {isSignUp ? 'Create Corpus AI Account' : 'Welcome to Corpus AI'}
                  </h3>
                  <p className="text-[11px] text-[#7E7A72]">
                    {isSignUp ? 'Start your systematic review project' : 'Sign in using your email'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="text-[#7E7A72] hover:text-[#462E1E] text-xs font-medium"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-medium text-[#462E1E] mb-1">Your Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#7E7A72] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Alex Rivera"
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2521]"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-[#462E1E] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#7E7A72] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@university.edu"
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2521]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#462E1E] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#7E7A72] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2521]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#6F4E37] hover:bg-[#5A3D29] text-white shadow-md shadow-[#6F4E37]/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{isSignUp ? 'Create Account & Enter' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-[#5F5C56]">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-[#6F4E37] font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New researcher?{' '}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-[#6F4E37] font-semibold hover:underline"
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-[#E6E0F0] py-4 text-xs text-[#7E7A72]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#462E1E]">Corpus AI</span>
            <span>•</span>
            <span>Minimalist Systematic Review & Agentic RAG Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Theme: #6F4E37 (Coffee) | #E5E4E2 (Platinum) | #E6E0F0 (Lavender)</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
