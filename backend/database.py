import sqlite3
import json
from typing import List, Dict, Any, Optional

DB_PATH = "corpus_ai.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Step 0: Review Questions & Protocol
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS review_questions (
        id TEXT PRIMARY KEY,
        title TEXT,
        question TEXT,
        population TEXT,
        intervention TEXT,
        comparator TEXT,
        outcome TEXT,
        criteria_json TEXT
    );
    """)

    # Step 1 & Level 2: Query Versions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS query_versions (
        id TEXT PRIMARY KEY,
        version_number INTEGER,
        query_string TEXT,
        sources_json TEXT,
        date_start TEXT,
        date_end TEXT,
        hit_count INTEGER,
        pulled_count INTEGER,
        created_at TEXT
    );
    """)

    # Step 3: Papers (Immutability Layer - Nothing Deleted)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        title TEXT,
        abstract TEXT,
        authors_json TEXT,
        year INTEGER,
        journal TEXT,
        doi TEXT,
        pmid TEXT,
        source TEXT,
        group_id TEXT,
        is_representative INTEGER DEFAULT 1,
        hidden INTEGER DEFAULT 0,
        deep_analysis_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # M2M: Which query versions found each paper
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS query_paper_links (
        query_version_id TEXT,
        paper_id TEXT,
        PRIMARY KEY (query_version_id, paper_id)
    );
    """)

    # Step 4: Duplicate Groups
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS duplicate_groups (
        group_id TEXT PRIMARY KEY,
        representative_id TEXT,
        confidence REAL,
        match_field TEXT,
        status TEXT
    );
    """)

    # Step 5: Reviewer Decisions (Keep Reviewer Decisions Across Loop)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviewer_decisions (
        paper_id TEXT PRIMARY KEY,
        group_id TEXT,
        status TEXT,
        reason TEXT,
        notes TEXT,
        decided_by TEXT,
        decided_at TEXT,
        is_overridden INTEGER DEFAULT 0
    );
    """)

    # AI Badges (Strict Explainability Requirement)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_badges (
        id TEXT PRIMARY KEY,
        paper_id TEXT,
        badge_type TEXT,
        label TEXT,
        why_snippet TEXT,
        text_evidence TEXT,
        confidence REAL,
        category TEXT
    );
    """)

    # Level 2 Run Log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        version_number INTEGER,
        step TEXT,
        action TEXT,
        actor TEXT,
        details TEXT,
        timestamp TEXT
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Corpus AI Database initialized successfully.")
