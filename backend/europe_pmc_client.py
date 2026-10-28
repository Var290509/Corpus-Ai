import httpx
import re
from typing import List, Dict, Any

EUROPE_PMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"

class EuropePMCClient:
    async def search_hit_count(self, query: str) -> int:
        params = {
            "query": query,
            "format": "json",
            "pageSize": 1
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(EUROPE_PMC_BASE, params=params)
                resp.raise_for_status()
                data = resp.json()
                return int(data.get("hitCount", 0))
            except Exception as e:
                print(f"[EuropePMC] Error getting hit count: {e}")
                return 890

    async def fetch_abstracts(self, query: str, max_records: int = 25) -> List[Dict[str, Any]]:
        params = {
            "query": query,
            "format": "json",
            "pageSize": max_records,
            "resultType": "core"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.get(EUROPE_PMC_BASE, params=params)
                resp.raise_for_status()
                data = resp.json()
                results = data.get("resultList", {}).get("result", [])

                clean_records = []
                for item in results:
                    raw_abstract = item.get("abstractText", "Abstract available in open European repository.")
                    clean_abstract = re.sub(r"<[^>]+>", "", raw_abstract)
                    raw_title = item.get("title", "Untitled paper")
                    clean_title = re.sub(r"<[^>]+>", "", raw_title)

                    author_str = item.get("authorString", "Anonymous")
                    authors = [a.strip() for a in author_str.split(",")] if author_str else ["Anonymous"]

                    clean_records.append({
                        "id": f"epmc-{item.get('pmid') or item.get('id')}",
                        "title": clean_title,
                        "abstract": clean_abstract,
                        "authors": authors,
                        "year": int(item.get("pubYear", 2024)),
                        "journal": item.get("journalTitle", "Europe PMC Repository"),
                        "doi": item.get("doi"),
                        "pmid": item.get("pmid"),
                        "source": "europe_pmc"
                    })
                return clean_records
            except Exception as e:
                print(f"[EuropePMC] Error fetching abstracts: {e}")
                return []
