# 🧠 Corpus AI

### Autonomous Systematic Literature Review & Agentic RAG Platform
*A next-generation autonomous systematic review and deep literature synthesis platform.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Colab Ready](https://img.shields.io/badge/Google_Colab-Free_Tier_Ready-F9AB00?logo=googlecolab&logoColor=white)](notebooks/Corpus_AI_Google_Colab.ipynb)
[![React](https://img.shields.io/badge/Frontend-React_19_+_TypeScript_+_Vite-61DAFB?logo=react&logoColor=black)](frontend/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](backend/)
[![Theme](https://img.shields.io/badge/Theme-%236F4E37_%7C_%23E5E4E2_%7C_%23E6E0F0-6F4E37)](frontend/tailwind.config.js)

---

## 🌟 What is Corpus AI?

**Corpus AI** is an autonomous systematic literature review platform that fulfills and extends the classic Rayyan workflow (Steps 0 to 7) and introduces a breakthrough capability missing in existing tools: **an Autonomous Deep Data Analysis Agent powered by Agentic RAG**.

While conventional tools merely allow reviewers to skim titles and abstracts manually:
- **Corpus AI reads the total text of every research paper** to extract quantitative parameters (sample size $N$, hazard ratios, risk ratios, $p$-values, confidence intervals, trial duration, and primary endpoints).
- **Assigns Explainable AI Badges** (such as 🏆 *Gold Standard RCT*, 📊 *High Sample Power*, ⚠️ *High Risk of Bias / Animal Preclinical*, ⚡ *Divergent Finding*, and 🛡️ *Safety Signal*) and **strictly explains *why* the badge was given** with verbatim quotation evidence.
- **Features an Interactive Agentic RAG Copilot** capable of synthesizing findings, calculating meta-analytical consensus percentages, and detecting cross-trial contradictions across **more than 1,000 research papers** in real time!
- **Implements the full Level 2 Loop**: Editing queries spawns non-destructive versions ($V_1 \rightarrow V_2$), runs incremental fetches, preserves prior reviewer decisions, provides side-by-side diffs, enables exact reverts, and flags duplicate merge conflicts for human resolution.

---

## 🎨 Design System: Minimalism & Glassmorphism

Corpus AI strictly utilizes the hackathon specification color palette:
- **`#6F4E37`** (*Coffee / Warm Umber*): Primary brand accents, action buttons, active tags, and key focus states.
- **`#E5E4E2`** (*Platinum / Pale Silver*): Background base, delicate frosted borders, and structural framing.
- **`#E6E0F0`** (*Soft Lavender / Wisteria Frost*): Frosted glass card backdrops, subtle glow highlights, and badge accents.

**UI Philosophy:** Clean minimalism, deliberate typography (Inter & JetBrains Mono), translucent frosted glass panels with `backdrop-filter: blur(16px)`, zero clutter, and high-performance virtualized scrolling for 1,000+ papers at 60 FPS.

---

## 🔄 End-to-End Pipeline Architecture (Steps 0 to 7 + Level 2 Loop)

```
[0. Question]  -->  [1. Query]  -->  [2. Fetch]  -->  [3. Database]
(PICO, criteria)  (keyphrases, dates)  (APIs: PubMed/EuropePMC)  (nothing deleted)
                                                                 |
[7. Review]    <--  [6. PICO]   <--  [5. Screen] <--  [4. Deduplicate]
(review, export)  (P, I, C, O tags)  (3-way, with reason)   (hide; confirm pairs)
      |                                                            ^
      +================== [LEVEL 2 RETURN LOOP] ===================+
        Query edited: new version, rerun steps 2-6, keep earlier decisions
```

1. **Step 0: Systematic Review Question & Protocol:** Formulates the research question in PICO structure with pre-specified inclusion and exclusion criteria with clear scientific rationales.
2. **Step 1: Multi-Database Query Builder:** Builds Boolean queries (`AND`, `OR`, `NOT`, quotes), date windows, and source selections. Saves each search as a Query Version ($V_1, V_2, \dots$).
3. **Step 2: Live Fetch APIs:** Searches **PubMed (NCBI E-utilities)** and **Europe PMC REST APIs**, respecting rate limits and displaying hit counts before pulling.
4. **Step 3: Database & Immutability:** Nothing is ever deleted. Duplicate and excluded records are marked and hidden, preserving full provenance.
5. **Step 4: Two-Tier Deduplication:** Exact match on DOI or PMID; fuzzy 3-gram Jaccard matching ($\ge 0.85$) bounded by year and author for records lacking DOI.
6. **Step 5: Automated & Human Screening:** Rules and algorithms detect animal studies (`EXC-ANIMAL`), non-English text (`EXC-NON-ENG`), simulations (`EXC-SIM`), and case reports (`EXC-CASE`). Humans have complete 1-click override power.
7. **Step 6: PICO Extraction:** Sentence-level tagging of Population, Intervention, Comparator, and Outcome with color-coded highlight overlays.
8. **Step 7: PRISMA Review & Export:** PRISMA 2020 flow reporting and 1-click export in CSV, RIS (for EndNote/Zotero/Rayyan), and JSON formats.

---

## ⚡ The Level 2 Loop: Query Mutations & Edge Cases

The problem statement requires answering two fundamental questions:

### Q1: What happens when a record you excluded appears again under a new query?
**Corpus AI Solution:** The record **remains Excluded**. Decisions are tied to the entity group ID (`groupId`) and normalized DOI/PMID, not to the query string. When Query $V_2$ re-fetches an excluded paper, the system detects it in the database, records that $V_2$ also found it, and retains its excluded status, exclusion reason code, and reviewer audit timestamp.

### Q2: What happens when two records you judged differently turn out to be duplicates?
**Corpus AI Solution:** The system **never resolves conflicts silently**. When two records previously screened with conflicting decisions (e.g., Record A was *Included* and Record B was *Excluded*) merge into a single duplicate cluster, Corpus AI flags a **"Duplicate Group Merge Conflict"** and opens the **Conflict Resolution Desk**, empowering the human reviewer to make the final determination.

---

## 🚀 Quickstart: Running Corpus AI Locally

### Prerequisites
- Node.js $\ge 18$
- Python $\ge 3.10$ (optional, if running the FastAPI backend)

### 1. Run the Web Application (Instant 1-Click Mode)
The frontend includes a self-contained local engine with live API querying, deduplication, screening, and Agentic RAG:
```bash
# Clone the repository
git clone https://github.com/Var290509/Corpus-Ai.git
cd Corpus-Ai/frontend

# Install dependencies and start
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 2. Run the Full-Stack FastAPI Backend
```bash
cd Corpus-Ai/backend
pip install -r requirements.txt
python main.py
```
Backend API will be running on **`http://localhost:8000/`** with interactive Swagger documentation at **`http://localhost:8000/docs`**.

---

## ☁️ Google Colab Free Tier Runner

We provide a zero-configuration Jupyter Notebook that runs the full Corpus AI application on Google Colab's free tier with a public HTTPS tunnel:
- Open [`notebooks/Corpus_AI_Google_Colab.ipynb`](notebooks/Corpus_AI_Google_Colab.ipynb) directly in Google Colab.
- Run all cells to launch the backend and open the generated public tunnel link.

---

## 📁 Repository Structure

```
Corpus-Ai/
├── frontend/                     # Modern React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Glassmorphism UI (Navbar, Flowchart, Search, Badges, RAG Desk)
│   │   ├── services/             # Live PubMed & Europe PMC API clients, Dedup, RAG Synthesizer
│   │   ├── types/                # Domain models for PICO, Queries, Badges, Diffs, Audit Logs
│   │   └── App.tsx               # Main application container
│   ├── tailwind.config.js        # Strict theme colors #6F4E37, #E5E4E2, #E6E0F0
│   └── vite.config.ts
├── backend/                      # Python FastAPI server
│   ├── main.py                   # REST API endpoints & static serving
│   ├── pubmed_client.py          # NCBI E-utilities proxy with rate limits
│   ├── europe_pmc_client.py      # Europe PMC REST client
│   ├── deduplication_engine.py   # Multi-field fuzzy deduplication
│   ├── agentic_rag.py            # Deep text extraction & multi-hop RAG
│   ├── database.py               # SQLite relational database layer
│   └── requirements.txt
├── notebooks/
│   └── Corpus_AI_Google_Colab.ipynb # Free-tier Google Colab 1-click runner
├── docs/
│   ├── LEVEL_2_LOOP_DESIGN.md    # 1-page Level 2 Loop Design Specification
│   └── HACKATHON_REPORT.md       # 3-page Hackathon Engineering Report
└── README.md
```

---

## 🏆 Hackathon Compliance Checklist

- [x] End-to-end working system from Step 0 to Step 7.
- [x] Autonomous Agent & Agentic RAG reading total text across 1,000+ papers.
- [x] Explainable AI Badges with strict attribution and quotation evidence.
- [x] Avoids example given in PDF (uses high-impact neurodegenerative clinical trial review topic).
- [x] Non-destructive Level 2 Loop with Query Versions, diff view, and exact revert.
- [x] Handles duplicate merge conflicts with human-in-the-loop controls.
- [x] Minimalist glassmorphism design strictly employing `#6F4E37`, `#E5E4E2`, `#E6E0F0`.
- [x] Google Colab 1-click notebook (`notebooks/Corpus_AI_Google_Colab.ipynb`).
- [x] 1-page loop design document (`docs/LEVEL_2_LOOP_DESIGN.md`).
- [x] 3-page technical engineering report (`docs/HACKATHON_REPORT.md`).
- [x] Ready for 5-minute live demo and automated test evaluation.
