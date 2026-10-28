# Level 2 Loop Design Specification: Corpus AI

## 1. Executive Summary & Philosophy
In systematic literature reviews, queries evolve iteratively. When a search query changes (e.g., adding synonyms or narrowing date windows), the literature pool mutates. A naive system discards prior reviewer effort or corrupts data. 
**Corpus AI implements a Non-Destructive, Versioned Loop Architecture** where every query modification spawns an immutable Query Version ($V_1 \rightarrow V_2 \rightarrow V_n$). Reviewer judgments attach to **entity groups (the paper identity)** rather than ephemeral queries, guaranteeing 100% preservation of human decisions, deterministic repeatability, and clear diff visualization.

---

## 2. Step-by-Step Change Impact & Decision Preservation

| Step | What a Reviewer Goes Back to Change | Downstream Steps Affected | How Decisions & Data Stay Safe |
| :--- | :--- | :--- | :--- |
| **0. Question** | Modifies PICO definitions or updates inclusion/exclusion criteria. | Affects Steps 1, 5, 6, and 7. | Prior manual overrides remain locked with an audit badge `(Human Verified)`. Only machine recommendations update. |
| **1. Query** | Adds new Boolean terms, changes date windows, or toggles sources. | Triggers Steps 2, 3, 4, 5, 6, 7. | Incremental fetch executes: only previously unseen PMIDs/DOIs are retrieved. Stored records remember which version found them. |
| **2. Fetch** | Approves hit counts to pull abstracts into database. | Updates Step 3. | Raw abstracts are ingested into the immutable database layer; no record is ever deleted. |
| **3. Database** | Links records to multiple query version IDs. | Steps 4 to 7. | Records retrieved by multiple versions are stored once with `queryVersionIds = ['v1', 'v2']`. |
| **4. Deduplicate** | New records may merge two previously distinct groups. | Steps 5, 6, 7. | Deduplication reruns on the superset. Representative record is updated; secondary copies are marked `hidden=true` (never deleted). |
| **5. Screen** | Re-screens newly added records. | Steps 6 and 7. | **Existing human decisions are never overwritten.** Only newly ingested or unscreened records undergo classification. |
| **6. PICO** | Edits or corrects PICO span annotations. | Step 7. | User-tagged spans have highest priority over machine-inferred spans. |
| **7. Review** | Exports or generates PRISMA flow diagrams. | None (terminal). | Reflects the active query version slice or the cumulative project state. |

---

## 3. Mandatory Answers to Core Edge Cases

### Case A: What happens when a record you excluded appears again under a new query?
- **Behavior:** The record **remains Excluded**.
- **Mechanism:** In Corpus AI, a reviewer's decision is attached to the canonical entity group ID (`groupId`) and normalized DOI/PMID, **not** to the transient query. When Query $V_2$ returns an abstract already evaluated in $V_1$, the system detects the existing record in the database, appends `v2` to its `queryVersionIds` array, and retains its `status: 'exclude'`, the recorded exclusion reason, the reviewer timestamp, and audit trail. The reviewer does not waste time re-evaluating the same paper.

### Case B: What happens when two records you judged differently turn out to be duplicates?
- **Scenario:** Record A was evaluated under $V_1$ and marked **Included**. Record B was fetched under $V_2$ with a slight title variation and marked **Excluded** (or vice versa). In Step 4 deduplication, fuzzy title matching reveals Record A and B are duplicates and merges them into one group.
- **Behavior:** The system **never resolves conflicts silently**.
- **Mechanism:** The Level 2 Loop Manager triggers a **"Duplicate Group Merge Conflict Alert"**. Both records are presented side-by-side in the *Conflict Resolution Desk* showing the conflicting decisions, dates, and rationale. The human reviewer is prompted to make a final binding selection (`Include` or `Exclude`) for the merged representative record. Every resolution is timestamped and recorded in the audit log.

---

## 4. Repeatability & The Diff Engine
1. **Diff View:** Whenever a query is modified, Corpus AI computes a visual set delta:
   $$\Delta = \text{Target}(V_{\text{new}}) - \text{Base}(V_{\text{old}})$$
   Categorizing records into:
   - **Records Added:** Papers newly introduced by query expansion.
   - **Records Removed / Filtered:** Papers excluded by query narrowing (soft-hidden, preserved in database).
   - **Newly Merged Groups:** Duplicates merged across query iterations.
2. **Exact Revert:** Clicking "Revert to Version $K$" deterministically filters the database view to records where $K \in \text{queryVersionIds}$, restoring the exact historical state, duplicate clustering, and screening counters without loss of subsequent work.
