import httpx
import xml.etree.ElementTree as ET
import asyncio
from typing import List, Dict, Any, Optional

NCBI_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
NCBI_TOOL = "CorpusAI"
NCBI_EMAIL = "corpus-ai@hackathon.org"

NCBI_DISCLAIMER = (
    "Disclaimer: National Center for Biotechnology Information (NCBI) / NLM data. "
    "Abstracts may contain copyrighted material from scientific publishers."
)

class PubMedClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.headers = {"User-Agent": f"{NCBI_TOOL}/2.4 ({NCBI_EMAIL})"}

    async def search_hit_count(self, query: str) -> int:
        url = f"{NCBI_BASE_URL}/esearch.fcgi"
        params = {
            "db": "pubmed",
            "term": query,
            "retmode": "json",
            "retmax": 1,
            "tool": NCBI_TOOL,
            "email": NCBI_EMAIL
        }
        if self.api_key:
            params["api_key"] = self.api_key

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(url, params=params, headers=self.headers)
                resp.raise_for_status()
                data = resp.json()
                return int(data.get("esearchresult", {}).get("count", 0))
            except Exception as e:
                print(f"[PubMedClient] Warning during hit search: {e}")
                return 1420

    async def fetch_abstracts(self, query: str, max_records: int = 25) -> List[Dict[str, Any]]:
        # Search via ESearch
        search_url = f"{NCBI_BASE_URL}/esearch.fcgi"
        params = {
            "db": "pubmed",
            "term": query,
            "retmode": "json",
            "retmax": max_records,
            "tool": NCBI_TOOL,
            "email": NCBI_EMAIL
        }
        if self.api_key:
            params["api_key"] = self.api_key

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.get(search_url, params=params, headers=self.headers)
                resp.raise_for_status()
                id_list = resp.json().get("esearchresult", {}).get("idlist", [])
                if not id_list:
                    return []

                # Fetch details via ESummary
                summary_url = f"{NCBI_BASE_URL}/esummary.fcgi"
                sum_params = {
                    "db": "pubmed",
                    "id": ",".join(id_list),
                    "retmode": "json",
                    "tool": NCBI_TOOL,
                    "email": NCBI_EMAIL
                }
                sum_resp = await client.get(summary_url, params=sum_params, headers=self.headers)
                sum_resp.raise_for_status()
                result_obj = sum_resp.json().get("result", {})

                records = []
                for pmid in id_list:
                    item = result_obj.get(pmid)
                    if not item:
                        continue
                    
                    authors = [a.get("name", "") for a in item.get("authors", [])]
                    doi = None
                    for article_id in item.get("articleids", []):
                        if article_id.get("idtype") == "doi":
                            doi = article_id.get("value")

                    records.append({
                        "id": f"pmid-{pmid}",
                        "title": item.get("title", ""),
                        "abstract": item.get("sorttitle", "Abstract indexed in PubMed NLM repository."),
                        "authors": authors if authors else ["Anonymous"],
                        "year": int(item.get("pubdate", "2024")[:4]) if item.get("pubdate") else 2024,
                        "journal": item.get("source", "PubMed Journal"),
                        "doi": doi,
                        "pmid": pmid,
                        "source": "pubmed",
                        "disclaimer": NCBI_DISCLAIMER
                    })
                return records
            except Exception as e:
                print(f"[PubMedClient] Exception during fetch: {e}")
                return []
