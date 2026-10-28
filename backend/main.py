import os
import json
import io
import re
from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from database import init_db, get_connection
from pubmed_client import PubMedClient
from europe_pmc_client import EuropePMCClient
from deduplication_engine import run_python_deduplication
from agentic_rag import AutonomousDeepAgent

app = FastAPI(
    title="Corpus AI Backend API",
    description="Autonomous Systematic Literature Review & Agentic RAG Platform",
    version="2.4.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pubmed_client = PubMedClient()
europe_pmc_client = EuropePMCClient()

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Corpus AI Agentic RAG Engine",
        "version": "2.4.0",
        "free_tier_ready": True
    }

class SearchRequest(BaseModel):
    query: str
    sources: List[str] = ["pubmed", "europe_pmc"]
    max_records: int = 25
    version_number: int = 1

@app.post("/api/search")
async def execute_search(req: SearchRequest):
    results = []
    if "pubmed" in req.sources:
        pm_results = await pubmed_client.fetch_abstracts(req.query, max_records=req.max_records)
        results.extend(pm_results)
    if "europe_pmc" in req.sources:
        epmc_results = await europe_pmc_client.fetch_abstracts(req.query, max_records=req.max_records)
        results.extend(epmc_results)

    # Run deduplication
    deduped_papers, groups = run_python_deduplication(results)

    # Run Deep Analysis & AI Badges
    agent = AutonomousDeepAgent(deduped_papers)
    for p in deduped_papers:
        analysis = agent.analyze_paper_deeply(p)
        p["deep_analysis"] = analysis
        p["ai_badges"] = analysis.get("ai_badges", [])

    return {
        "query": req.query,
        "version_number": req.version_number,
        "count": len(deduped_papers),
        "duplicate_groups_count": len(groups),
        "papers": deduped_papers
    }

class RAGQueryRequest(BaseModel):
    query: str
    papers: List[Dict[str, Any]]

@app.post("/api/agent/synthesize")
def synthesize_corpus(req: RAGQueryRequest):
    agent = AutonomousDeepAgent(req.papers)
    return agent.synthesize_query(req.query)

@app.post("/api/parse-document")
async def parse_document(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or "document.pdf"
    
    extracted_text = ""
    title = ""
    authors = ["Uploaded Author"]
    year = 2024
    
    if filename.lower().endswith(".pdf") or content.startswith(b"%PDF"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            meta = reader.metadata or {}
            title = meta.get("/Title") or ""
            author_meta = meta.get("/Author") or ""
            if author_meta:
                authors = [str(author_meta).strip()]
            
            pages_text = []
            for page in reader.pages[:10]:
                t = page.extract_text()
                if t:
                    pages_text.append(t)
            extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            pass

    if not extracted_text:
        try:
            extracted_text = content.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = ""

    # Clean up text from binary tokens
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]", " ", extracted_text)
    cleaned = re.sub(r"%\s*\d+\s+\d+\s+obj[\s\S]*?endobj", " ", cleaned)
    cleaned = re.sub(r"\d+\s+\d+\s+obj\s*<<[\s\S]*?>>", " ", cleaned)
    cleaned = re.sub(r"<<[\s\S]*?>>", " ", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()

    if not title:
        candidate_lines = [l.strip() for l in cleaned.split("\n") if len(l.strip()) > 5 and not l.strip().startswith("%")]
        if candidate_lines and len(candidate_lines[0]) < 220:
            title = candidate_lines[0]
        else:
            title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()

    abstract = cleaned[:900] if len(cleaned) > 50 else f"Uploaded research publication {filename} ingested into systematic review workspace."

    return {
        "filename": filename,
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "year": year
    }

# Serve built frontend in production (dist directory)
dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
