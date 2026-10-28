import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  FileText, 
  Calendar, 
  Layers, 
  ArrowRight, 
  Trash2, 
  LogOut,
  Upload,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Project, User, ReviewQuestion } from '../types';

interface ProjectsDashboardProps {
  user: User;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onLogout: () => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  user,
  projects,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLogout
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating a new project
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [population, setPopulation] = useState('');
  const [intervention, setIntervention] = useState('');
  const [comparator, setComparator] = useState('');
  const [outcome, setOutcome] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newQuestion: ReviewQuestion = {
      id: `q-${Date.now()}`,
      title: projectName,
      question: question.trim() || 'Custom Systematic Review Question',
      population: population.trim() || 'Adult study population',
      intervention: intervention.trim() || 'Primary therapeutic intervention',
      comparator: comparator.trim() || 'Active comparator or placebo control',
      outcome: outcome.trim() || 'Primary clinical and statistical endpoints',
      inclusionCriteria: [
        { id: `inc-${Date.now()}-1`, code: 'INC-HUMAN', text: 'Human clinical trials and prospective cohorts', rationale: 'Direct clinical relevance', detectionType: 'metadata', active: true },
        { id: `inc-${Date.now()}-2`, code: 'INC-END', text: 'Quantified primary outcomes and endpoints', rationale: 'Statistical evaluability', detectionType: 'algorithm', active: true }
      ],
      exclusionCriteria: [
        { id: `exc-${Date.now()}-1`, code: 'EXC-ANIMAL', text: 'Preclinical animal and rodent models', rationale: 'Lacks clinical human translation', detectionType: 'algorithm', active: true },
        { id: `exc-${Date.now()}-2`, code: 'EXC-NON-ENG', text: 'Non-English language publications', rationale: 'Auditability of primary clinical tables', detectionType: 'metadata', active: true },
        { id: `exc-${Date.now()}-3`, code: 'EXC-SIM', text: 'Computational in silico simulations / docking', rationale: 'Lacks in vivo biological endpoints', detectionType: 'algorithm', active: true },
        { id: `exc-${Date.now()}-4`, code: 'EXC-CASE', text: 'Single case reports (N=1)', rationale: 'Inability to infer average treatment effects', detectionType: 'metadata', active: true }
      ]
    };

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectName.trim(),
      description: projectDescription.trim() || 'Systematic literature review workspace',
      reviewQuestion: newQuestion,
      papers: [], // Starts completely clean with ZERO pre-seeded papers
      queryVersions: [
        {
          id: `qv-${Date.now()}`,
          versionNumber: 1,
          label: 'Initial Search & Uploads',
          queryString: '',
          keyphrases: [],
          booleanLogic: 'AND',
          sources: ['pubmed', 'europe_pmc'],
          hitCount: 0,
          pulledCount: 0,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isActive: true
        }
      ],
      decisions: {},
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          versionNumber: 1,
          step: 'Protocol',
          action: 'Created New Project Workspace',
          actor: 'human',
          details: `Initialized project "${projectName}" with user-defined PICO parameters`,
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    };

    onCreateProject(newProject);
    setShowCreateModal(false);
    
    // Reset form
    setProjectName('');
    setProjectDescription('');
    setQuestion('');
    setPopulation('');
    setIntervention('');
    setComparator('');
    setOutcome('');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#F5F4F2] via-[#EBE9E6] to-[#ECE7F4] text-[#2D2521]">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#E6E0F0] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6F4E37] to-[#8A5F40] flex items-center justify-center shadow-md shadow-[#6F4E37]/20 border border-[#E6E0F0]">
                <span className="text-[#E6E0F0] font-bold text-xl font-mono">C</span>
              </div>
              <div>
                <span className="font-semibold text-lg tracking-tight text-[#462E1E]">Corpus AI</span>
                <span className="text-xs text-[#7E7A72] block -mt-1">Projects Workspace</span>
              </div>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-semibold text-[#462E1E] block">{user.name}</span>
                <span className="text-[11px] text-[#7E7A72] block">{user.email}</span>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-[#7E7A72] hover:text-[#462E1E] hover:bg-white/60 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
        
        {/* Banner with Create Project CTA */}
        <div className="glass-panel-elevated rounded-2xl p-6 border border-[#E6E0F0] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-glass">
          <div>
            <h1 className="text-xl font-bold text-[#462E1E]">My Systematic Review Projects</h1>
            <p className="text-xs text-[#5F5C56] mt-1 max-w-xl">
              Create a project, define your PICO research question, and upload your own research papers (RIS, CSV, BibTeX, PDF) or query live PubMed.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#6F4E37] hover:bg-[#5A3D29] text-white shadow-md shadow-[#6F4E37]/20 transition-all flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#E6E0F0]" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const paperCount = proj.papers?.length || 0;
            const includedCount = proj.papers?.filter(p => proj.decisions?.[p.id]?.status === 'include').length || 0;

            return (
              <div
                key={proj.id}
                className="glass-card rounded-2xl p-5 border border-[#E6E0F0] hover:border-[#6F4E37]/40 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-[#E6E0F0] text-[#5A3D29]">
                      <Folder className="w-4 h-4 text-[#6F4E37]" />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="text-[#B8B5AE] hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-sm text-[#462E1E] group-hover:text-[#6F4E37] transition-colors line-clamp-1">
                    {proj.name}
                  </h3>

                  <p className="text-xs text-[#7E7A72] mt-1 line-clamp-2 leading-relaxed">
                    {proj.reviewQuestion?.question || proj.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#E6E0F0] grid grid-cols-2 gap-2 text-[11px] text-[#5F5C56]">
                    <div>
                      <span className="text-[#9B978F] block text-[10px]">Total Papers</span>
                      <strong className="font-mono text-[#462E1E]">{paperCount.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[#9B978F] block text-[10px]">Included</span>
                      <strong className="font-mono text-emerald-700">{includedCount}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E6E0F0] flex items-center justify-between">
                  <span className="text-[10px] text-[#9B978F]">Created: {proj.createdAt}</span>
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-[#6F4E37] hover:text-[#5A3D29] group-hover:translate-x-1 transition-transform"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="col-span-full glass-panel rounded-2xl p-12 text-center border border-dashed border-[#d4c8e4]">
              <Folder className="w-12 h-12 text-[#6F4E37]/40 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#462E1E]">No Systematic Review Projects Yet</h3>
              <p className="text-xs text-[#7E7A72] mt-1 max-w-sm mx-auto">
                Click "Create New Project" to define your review question and upload research papers.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#6F4E37] text-white hover:bg-[#5A3D29] shadow-sm inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Project</span>
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in text-left">
          <div 
            className="w-full max-w-2xl glass-panel-elevated rounded-2xl border border-[#E6E0F0] shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0F0]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6F4E37] flex items-center justify-center text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#462E1E]">Create New Systematic Review Project</h3>
                  <p className="text-[11px] text-[#7E7A72]">
                    Formulate your PICO research question and set up your research workspace.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#7E7A72] hover:text-[#462E1E] text-xs font-medium"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Project Title & Description */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#462E1E] mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. CRISPR-Cas9 Therapeutics in Hemoglobinopathies"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-[#2D2521]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#462E1E] mb-1">
                    Review Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. In patients with sickle cell disease, does exa-cel gene editing therapy, compared with standard chronic transfusion, reduce vaso-occlusive events?"
                    rows={2}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-[#2D2521] resize-none"
                  />
                </div>
              </div>

              {/* PICO Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[#E6E0F0]">
                <span className="text-xs font-semibold text-[#462E1E] block">
                  PICO Framework Parameters:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6F4E37] mb-1">
                      Population (P)
                    </label>
                    <input
                      type="text"
                      value={population}
                      onChange={(e) => setPopulation(e.target.value)}
                      placeholder="e.g. Patients with severe sickle cell disease"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-[#2D2521]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#8169A3] mb-1">
                      Intervention (I)
                    </label>
                    <input
                      type="text"
                      value={intervention}
                      onChange={(e) => setIntervention(e.target.value)}
                      placeholder="e.g. CRISPR-Cas9 exa-cel autologous infusion"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-[#2D2521]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#7E7A72] mb-1">
                      Comparator (C)
                    </label>
                    <input
                      type="text"
                      value={comparator}
                      onChange={(e) => setComparator(e.target.value)}
                      placeholder="e.g. Chronic blood transfusion or hydroxyurea"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-[#2D2521]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#5A3D29] mb-1">
                      Outcome (O)
                    </label>
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      placeholder="e.g. Elimination of vaso-occlusive crises & HbF levels"
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-[#2D2521]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-[#E6E0F0] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A3D29] hover:bg-black/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#6F4E37] hover:bg-[#5A3D29] text-white shadow-md shadow-[#6F4E37]/20 transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Project & Enter</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
