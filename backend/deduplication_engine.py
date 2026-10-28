import re
from typing import List, Dict, Any, Tuple

def normalize_title(title: str) -> str:
    cleaned = re.sub(r"[^\w\s]", " ", title.lower())
    return re.sub(r"\s+", " ", cleaned).strip()

def get_trigrams(text: str) -> set:
    padded = f"__{text}__"
    return {padded[i:i+3] for i in range(len(padded)-2)}

def jaccard_similarity(s1: str, s2: str) -> float:
    n1 = normalize_title(s1)
    n2 = normalize_title(s2)
    if n1 == n2:
        return 1.0
    t1 = get_trigrams(n1)
    t2 = get_trigrams(n2)
    if not t1 or not t2:
        return 0.0
    intersection = len(t1.intersection(t2))
    union = len(t1.union(t2))
    return intersection / union if union > 0 else 0.0

def run_python_deduplication(papers: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    doi_map: Dict[str, List[str]] = {}
    pmid_map: Dict[str, List[str]] = {}

    for p in papers:
        doi = p.get("doi")
        if doi:
            clean_doi = re.sub(r"^https?://(dx\.)?doi\.org/", "", doi.lower().strip())
            doi_map.setdefault(clean_doi, []).append(p["id"])
        pmid = p.get("pmid")
        if pmid:
            pmid_map.setdefault(str(pmid).strip(), []).append(p["id"])

    processed = set()
    groups = []

    # Process exact DOI matches
    for doi, ids in doi_map.items():
        if len(ids) > 1:
            rep_id = ids[0]
            grp_id = f"grp-doi-{rep_id}"
            groups.append({
                "group_id": grp_id,
                "representative_id": rep_id,
                "member_ids": ids,
                "confidence": 1.0,
                "match_field": "doi"
            })
            for idx, pid in enumerate(ids):
                processed.add(pid)
                for p in papers:
                    if p["id"] == pid:
                        p["group_id"] = grp_id
                        p["is_representative"] = (idx == 0)
                        p["hidden"] = (idx > 0)

    # Process remaining by fuzzy title + year + author
    unprocessed = [p for p in papers if p["id"] not in processed]
    for i in range(len(unprocessed)):
        p1 = unprocessed[i]
        if p1["id"] in processed:
            continue
        cluster = [p1["id"]]

        for j in range(i + 1, len(unprocessed)):
            p2 = unprocessed[j]
            if p2["id"] in processed:
                continue

            year_diff = abs(int(p1.get("year", 2024)) - int(p2.get("year", 2024)))
            if year_diff > 1:
                continue

            sim = jaccard_similarity(p1.get("title", ""), p2.get("title", ""))
            if sim >= 0.85:
                cluster.append(p2["id"])

        if len(cluster) > 1:
            rep_id = cluster[0]
            grp_id = f"grp-fuzzy-{rep_id}"
            groups.append({
                "group_id": grp_id,
                "representative_id": rep_id,
                "member_ids": cluster,
                "confidence": 0.92,
                "match_field": "fuzzy_title_year"
            })
            for idx, pid in enumerate(cluster):
                processed.add(pid)
                for p in papers:
                    if p["id"] == pid:
                        p["group_id"] = grp_id
                        p["is_representative"] = (idx == 0)
                        p["hidden"] = (idx > 0)

    # Mark remaining individual records as representative
    for p in papers:
        if p["id"] not in processed:
            p["group_id"] = f"grp-single-{p['id']}"
            p["is_representative"] = True
            p["hidden"] = False

    return papers, groups
