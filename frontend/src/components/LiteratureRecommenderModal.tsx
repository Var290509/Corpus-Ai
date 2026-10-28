import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  Check, 
  ExternalLink, 
  Plus, 
  X, 
  Database,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Bookmark
} from 'lucide-react';
import { ResearchPaper, SuggestedPaper } from '../types';
import { recommendLiterature, convertSuggestedToPaper } from '../services/literatureRecommender';
import gsap from 'gsap';

interface LiteratureRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  seedPaper?: ResearchPaper | null;
  allProjectPapers: ResearchPaper[];
  onAddPaperToCorpus: (paper: ResearchPaper) => void;
}

export const LiteratureRecommenderModal: React.FC<LiteratureRecommenderModalProps> = ({
  isOpen,
  onClose,
  seedPaper,
  allProjectPapers,
  onAddPaperToCorpus
}) => {
  const [selectedSeedId, setSelectedSeedId] = useState<string>(seedPaper?.id || (allProjectPapers[0]?.id || 'custom'));
  const [customTitle, setCustomTitle] = useState('');
  const [customAbstract, setCustomAbstract] = useState('');
  
  // Selected databases
  const [enabledDatabases, setEnabledDatabases] = useState<Array<'scopus' | 'web_of_science' | 'pubmed' | 'ieee_xplore' | 'library'>>([
    'scopus', 'web_of_science', 'pubmed', 'ieee_xplore', 'library'
  ]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SuggestedPaper[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Animate modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
      handleDiscover();
    }
  }, [isOpen]);

  // Animate results when loaded
  useEffect(() => {
    if (results.length > 0 && resultsContainerRef.current) {
      gsap.fromTo(
        resultsContainerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [results]);

  const handleDiscover = async () => {
    setLoading(true);
    let currentSeed = allProjectPapers.find(p => p.id === selectedSeedId);
    
    const recs = await recommendLiterature({
      seedPaper: currentSeed,
      queryTitle: customTitle,
      queryAbstract: customAbstract,
      targetDatabases: enabledDatabases
    });

    setResults(recs);
    setLoading(false);
  };

  const handleToggleDb = (db: 'scopus' | 'web_of_science' | 'pubmed' | 'ieee_xplore' | 'library') => {
    if (enabledDatabases.includes(db)) {
      if (enabledDatabases.length > 1) {
        setEnabledDatabases(enabledDatabases.filter(d => d !== db));
      }
    } else {
      setEnabledDatabases([...enabledDatabases, db]);
    }
  };

  const handleAdd = (paper: SuggestedPaper) => {
    const fullPaper = convertSuggestedToPaper(paper);
    onAddPaperToCorpus(fullPaper);
    setAddedIds(prev => new Set(prev).add(paper.id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div 
        ref={modalRef}
        className="w-full max-w-4xl bg-[#1F140D]/95 text-[#E5E4E2] border border-[#E6E0F0]/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E0F0]/15 bg-[#2B1B12]/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#FAF9F8]">
                  AI Literature Recommender
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#E6E0F0]/15 text-[#E6E0F0] border border-[#E6E0F0]/25">
                  Multi-Index Discovery
                </span>
              </div>
              <p className="text-xs text-[#C5BFB8]">
                Cross-database suggestion engine querying Scopus, Web of Science, PubMed, IEEE Xplore & Digital Libraries
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#B8B3AC] hover:text-[#FAF9F8] hover:bg-[#3D2619] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query & Database Controls */}
        <div className="p-6 border-b border-[#E6E0F0]/10 bg-[#1A1009]/60 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Seed selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#E6E0F0] mb-1.5 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#E5E4E2]" />
                <span>Seed Paper to Base Recommendations On:</span>
              </label>
              <select
                value={selectedSeedId}
                onChange={(e) => setSelectedSeedId(e.target.value)}
                className="w-full bg-[#2B1B12] border border-[#E6E0F0]/25 text-[#FAF9F8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E6E0F0]"
              >
                {allProjectPapers.map((p, idx) => (
                  <option key={p.id} value={p.id}>
                    Paper #{idx + 1}: {p.title.slice(0, 75)}... ({p.year})
                  </option>
                ))}
                <option value="custom">✏️ Enter Custom Research Title / Abstract Manually</option>
              </select>
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <button
                onClick={handleDiscover}
                disabled={loading}
                className="w-full h-[38px] px-4 rounded-xl font-medium text-xs bg-gradient-to-r from-[#E5E4E2] to-[#E6E0F0] text-[#1F140D] hover:brightness-105 shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Search className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Scanning Indexes...' : 'Scan All 5 Databases'}</span>
              </button>
            </div>
          </div>

          {/* Custom Input if selected */}
          {selectedSeedId === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <input
                type="text"
                placeholder="Enter seed paper title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#2B1B12] border border-[#E6E0F0]/20 rounded-xl px-3 py-1.5 text-xs text-[#FAF9F8] placeholder-[#8E8680]"
              />
              <input
                type="text"
                placeholder="Enter core abstract or focus keywords..."
                value={customAbstract}
                onChange={(e) => setCustomAbstract(e.target.value)}
                className="w-full bg-[#2B1B12] border border-[#E6E0F0]/20 rounded-xl px-3 py-1.5 text-xs text-[#FAF9F8] placeholder-[#8E8680]"
              />
            </div>
          )}

          {/* Database Selector Badges */}
          <div>
            <span className="text-[11px] font-semibold text-[#B8B3AC] block mb-2">
              Target Scholarly Databases:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'scopus', name: 'Scopus (Elsevier)', icon: Layers, color: 'text-amber-300' },
                { id: 'web_of_science', name: 'Web of Science (Clarivate)', icon: TrendingUp, color: 'text-emerald-300' },
                { id: 'pubmed', name: 'PubMed / MEDLINE (NIH)', icon: Database, color: 'text-sky-300' },
                { id: 'ieee_xplore', name: 'IEEE Xplore Digital', icon: Cpu, color: 'text-indigo-300' },
                { id: 'library', name: 'Institutional Digital Library', icon: Bookmark, color: 'text-purple-300' },
              ].map((db) => {
                const isActive = enabledDatabases.includes(db.id as any);
                const IconComponent = db.icon;
                return (
                  <button
                    key={db.id}
                    onClick={() => handleToggleDb(db.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center space-x-1.5 transition-all border ${
                      isActive 
                        ? 'bg-[#3D2619] text-[#FAF9F8] border-[#E6E0F0]/40 shadow-sm' 
                        : 'bg-[#1F140D]/40 text-[#7E7A72] border-transparent hover:text-[#B8B3AC]'
                    }`}
                  >
                    <IconComponent className={`w-3 h-3 ${isActive ? db.color : 'text-gray-500'}`} />
                    <span>{db.name}</span>
                    {isActive && <Check className="w-2.5 h-2.5 text-[#E6E0F0]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#150D08]/80">
          <div className="flex items-center justify-between text-xs text-[#B8B3AC] pb-1">
            <span>
              Found <strong className="text-[#FAF9F8]">{results.length}</strong> Seminal & High-Concordance Recommendations
            </span>
            <span>Sorted by Multi-Index Similarity</span>
          </div>

          <div ref={resultsContainerRef} className="space-y-3">
            {results.map((rec) => {
              const isAdded = addedIds.has(rec.id);
              return (
                <div 
                  key={rec.id}
                  className="bg-[#241710]/90 border border-[#E6E0F0]/15 hover:border-[#E6E0F0]/40 rounded-xl p-4 transition-all hover:bg-[#2D1D14] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Database & Score Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {rec.databases.map(d => (
                        <span 
                          key={d}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-[#3B2518] text-[#E6E0F0] border border-[#E6E0F0]/20"
                        >
                          {d === 'web_of_science' ? 'Web of Science' : d.replace('_', ' ')}
                        </span>
                      ))}

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                        {rec.similarityScore}% Fit Score
                      </span>

                      <span className="text-[11px] text-[#A59E98]">
                        • {rec.citationCount} Citations
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[#FAF9F8] leading-snug">
                      {rec.title}
                    </h3>

                    {/* Authors & Journal */}
                    <div className="text-xs text-[#C5BFB8] flex items-center space-x-2">
                      <span>{rec.authors.join(', ')}</span>
                      <span>•</span>
                      <span className="italic text-[#E6E0F0]/80">{rec.journal}</span>
                      <span>•</span>
                      <span>({rec.year})</span>
                    </div>

                    {/* Recommendation Reason */}
                    <div className="p-2.5 rounded-lg bg-[#180E08]/70 border border-[#E6E0F0]/10 text-xs text-[#D5D0C9] flex items-start space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#E6E0F0] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="text-[#FAF9F8]">Why Suggested:</strong> {rec.recommendationReason}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex md:flex-col gap-2">
                    <button
                      onClick={() => handleAdd(rec)}
                      disabled={isAdded}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 cursor-default'
                          : 'bg-[#E5E4E2] text-[#1F140D] hover:bg-white shadow-md'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Imported</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Import to Review</span>
                        </>
                      )}
                    </button>

                    {rec.doi && (
                      <a
                        href={`https://doi.org/${rec.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-[#C5BFB8] hover:text-[#FAF9F8] bg-[#1F140D] border border-[#E6E0F0]/15 flex items-center justify-center space-x-1 hover:border-[#E6E0F0]/30"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E6E0F0]/15 bg-[#1F140D] flex items-center justify-between text-xs text-[#A59E98]">
          <span>
            Scopus • Web of Science • PubMed/MEDLINE • IEEE Xplore • Cross-Institutional Digital Library
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-[#E5E4E2] hover:bg-[#3D2619] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
