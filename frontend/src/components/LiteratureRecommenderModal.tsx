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
  TrendingUp,
  Cpu,
  Star
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
  
  // Exact 4 target databases from user handwritten note (Image 4)
  const [enabledDatabases, setEnabledDatabases] = useState<Array<'scopus' | 'web_of_science' | 'pubmed' | 'ieee_xplore'>>([
    'scopus', 'web_of_science', 'pubmed', 'ieee_xplore'
  ]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SuggestedPaper[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Sync seed paper when prop changes
  useEffect(() => {
    if (seedPaper?.id) {
      setSelectedSeedId(seedPaper.id);
    }
  }, [seedPaper]);

  // Animate modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
      handleDiscover();
    }
  }, [isOpen, selectedSeedId]);

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
    const currentSeed = allProjectPapers.find(p => p.id === selectedSeedId);
    
    const recs = await recommendLiterature({
      seedPaper: currentSeed,
      queryTitle: customTitle || currentSeed?.title,
      queryAbstract: customAbstract || currentSeed?.abstract,
      targetDatabases: enabledDatabases
    });

    setResults(recs);
    setLoading(false);
  };

  const handleToggleDb = (db: 'scopus' | 'web_of_science' | 'pubmed' | 'ieee_xplore') => {
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

  const currentSeedObject = allProjectPapers.find(p => p.id === selectedSeedId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        ref={modalRef}
        className="w-full max-w-4xl bg-[#362419] text-[#E8D8CE] border border-[#E6E0F0]/25 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E0F0]/20 bg-[#442E20]/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#9E88BE] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#E8D8CE]">
                  Related Literature Recommender
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/25">
                  Multi-Database Discovery
                </span>
              </div>
              <p className="text-xs text-[#E8D8CE]/80">
                Recommending related papers from Scopus, Web of Science, PubMed/MEDLINE & IEEE Xplore based on your uploaded research file
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#E8D8CE] hover:text-white hover:bg-[#4A3324] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query & Database Controls */}
        <div className="p-6 border-b border-[#E6E0F0]/15 bg-[#2B1B12]/70 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Seed selector from uploaded files */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#E8D8CE] mb-1.5 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#E6E0F0]" />
                <span>Base Recommendations on Uploaded Paper:</span>
              </label>
              <select
                value={selectedSeedId}
                onChange={(e) => setSelectedSeedId(e.target.value)}
                className="w-full bg-[#241710] border border-[#E6E0F0]/30 text-[#E8D8CE] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E6E0F0]"
              >
                {allProjectPapers.map((p, idx) => (
                  <option key={p.id} value={p.id} className="bg-[#241710] text-[#E8D8CE]">
                    Paper #{idx + 1}: {p.title.slice(0, 75)}... ({p.year})
                  </option>
                ))}
                <option value="custom" className="bg-[#241710] text-[#E8D8CE]">✏️ Enter Custom Title / Abstract Manually</option>
              </select>
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <button
                onClick={handleDiscover}
                disabled={loading}
                className="w-full h-[38px] px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#E8D8CE] to-[#E6E0F0] text-[#2C1E16] hover:brightness-105 shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Search className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Searching Databases...' : 'Search 4 Databases'}</span>
              </button>
            </div>
          </div>

          {/* Show Current Seed Details */}
          {currentSeedObject && (
            <div className="p-3 rounded-xl bg-[#241710] border border-[#E6E0F0]/15 text-xs text-[#E8D8CE]/90 flex items-start space-x-2.5">
              <span className="font-bold text-[#E8D8CE] shrink-0">Selected Seed:</span>
              <div className="truncate">
                <span className="font-semibold text-[#E8D8CE]">{currentSeedObject.title}</span>
                <span className="text-[11px] text-[#E8D8CE]/70 block truncate mt-0.5">{currentSeedObject.abstract}</span>
              </div>
            </div>
          )}

          {/* Custom Input if selected */}
          {selectedSeedId === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <input
                type="text"
                placeholder="Enter seed paper title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#241710] border border-[#E6E0F0]/25 rounded-xl px-3 py-1.5 text-xs text-[#E8D8CE] placeholder-[#C5BFB8]/60"
              />
              <input
                type="text"
                placeholder="Enter core abstract or focus keywords..."
                value={customAbstract}
                onChange={(e) => setCustomAbstract(e.target.value)}
                className="w-full bg-[#241710] border border-[#E6E0F0]/25 rounded-xl px-3 py-1.5 text-xs text-[#E8D8CE] placeholder-[#C5BFB8]/60"
              />
            </div>
          )}

          {/* Exact 4 Database Selector Badges from handwritten note */}
          <div>
            <span className="text-[11px] font-semibold text-[#E8D8CE]/80 block mb-2">
              Target Scholarly Databases (Image 4):
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'scopus', name: 'SCOPUS (Elsevier)', icon: Layers, color: 'text-amber-300' },
                { id: 'web_of_science', name: 'Web of science (Clarivate)', icon: TrendingUp, color: 'text-emerald-300' },
                { id: 'pubmed', name: 'PubMed / MEDLINE', icon: Database, color: 'text-sky-300' },
                { id: 'ieee_xplore', name: 'IEEE xplore digital library', icon: Cpu, color: 'text-indigo-300' },
              ].map((db) => {
                const isActive = enabledDatabases.includes(db.id as any);
                const IconComponent = db.icon;
                return (
                  <button
                    key={db.id}
                    onClick={() => handleToggleDb(db.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-[#4A3324] text-[#E8D8CE] border-[#E6E0F0]/40 shadow-sm' 
                        : 'bg-[#241710]/60 text-[#E8D8CE]/50 border-transparent hover:text-[#E8D8CE]'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? db.color : 'text-gray-400'}`} />
                    <span>{db.name}</span>
                    {isActive && <Check className="w-3 h-3 text-[#E6E0F0]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#2C1E16]/90">
          <div className="flex items-center justify-between text-xs text-[#E8D8CE]/80 pb-1">
            <span>
              Found <strong className="text-[#E8D8CE]">{results.length}</strong> Seminal Recommendations from Scopus, WoS, PubMed & IEEE
            </span>
            <span>Sorted by Citation Concordance</span>
          </div>

          <div ref={resultsContainerRef} className="space-y-3">
            {results.map((rec) => {
              const isAdded = addedIds.has(rec.id);
              return (
                <div 
                  key={rec.id}
                  className="bg-[#362419] border border-[#E6E0F0]/20 hover:border-[#E6E0F0]/50 rounded-xl p-4 transition-all hover:bg-[#442E20] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Database & Fit Score Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {rec.databases.map(d => (
                        <span 
                          key={d}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-[#4A3324] text-[#E6E0F0] border border-[#E6E0F0]/25"
                        >
                          {d === 'web_of_science' ? 'Web of Science' : d.replace('_', ' ')}
                        </span>
                      ))}

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                        {rec.similarityScore}% Fit Score
                      </span>

                      <span className="text-[11px] text-[#E8D8CE]/70">
                        • {rec.citationCount} Citations
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-[#E8D8CE] leading-snug">
                      {rec.title}
                    </h3>

                    {/* Authors & Journal */}
                    <div className="text-xs text-[#E8D8CE]/80 flex items-center space-x-2">
                      <span>{rec.authors.join(', ')}</span>
                      <span>•</span>
                      <span className="italic text-[#E6E0F0]">{rec.journal}</span>
                      <span>•</span>
                      <span>({rec.year})</span>
                    </div>

                    {/* Recommendation Reason */}
                    <div className="p-2.5 rounded-lg bg-[#271911] border border-[#E6E0F0]/15 text-xs text-[#E8D8CE] flex items-start space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#E6E0F0] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="text-[#E8D8CE]">Why Suggested:</strong> {rec.recommendationReason}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex md:flex-col gap-2">
                    <button
                      onClick={() => handleAdd(rec)}
                      disabled={isAdded}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-950 text-emerald-200 border border-emerald-700/60 cursor-default'
                          : 'bg-[#E8D8CE] text-[#2C1E16] hover:bg-white shadow-md'
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
                        className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-[#E8D8CE] hover:text-white bg-[#241710] border border-[#E6E0F0]/20 flex items-center justify-center space-x-1 hover:border-[#E6E0F0]/40"
                      >
                        <span>View DOI</span>
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
        <div className="px-6 py-3 border-t border-[#E6E0F0]/20 bg-[#271911] flex items-center justify-between text-xs text-[#E8D8CE]/70">
          <span>
            Scopus • Web of Science • PubMed / MEDLINE • IEEE Xplore Digital Library
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#E8D8CE] hover:bg-[#4A3324] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
