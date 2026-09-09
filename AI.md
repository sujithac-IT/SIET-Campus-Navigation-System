# 🤖 AI Campus Assistant — Grounded RAG Architecture

## Core Design Constraint

> **THE AI MUST NEVER HALLUCINATE CAMPUS INFORMATION.**

If requested data does not exist in verified database records:
`"I couldn't find verified information for that request in the campus database."`

---

## Retrieval Pipeline

1. **User Query Input**: Natural language question (e.g. "Where is LH-25?", "Find nearest restroom", "Where is my next class?").
2. **Database Record Lookup**: Query matches against SQL room codes, building names, event titles, and faculty directories.
3. **Grounded Synthesis**: Forms factual summary string strictly referencing retrieved entities.
4. **Deep-Link Generation**: Attaches UI deep-link actions (`[Navigate to LH-25]`).
5. **Confidence Rating**: Rates response factual assurance (`High Confidence`, `Moderate Confidence`, `Low Confidence`).
6. **Human Escalation**: Offers one-click "Speak to Campus Support" if confidence is low or retrieval yields zero verified matches.
