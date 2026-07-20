# Learning Tracker

A personal learning tracker for interview prep — built to solve one problem: you learn a topic, then forget to revise it. This app makes revision the first thing you see every time you open it, not an afterthought.

Single-page app, React + TypeScript + Tailwind, no backend. All data lives in your browser's `localStorage`; back it up or move machines with JSON export/import.

**Live app:** [learning-daily-tracker.vercel.app](https://learning-daily-tracker.vercel.app/)

## Features

- **Revise first** — on load, the home screen leads with everything due or overdue for revision, sorted oldest-due-first. Nothing else competes for attention above it.
- **Spaced repetition** — each topic is scheduled at increasing intervals after you learn it: 1, 3, 7, 14, then 30 days. Marking a revision "Done" advances it to the next interval, counted from the day you actually reviewed (so a late review doesn't compound). Marking it "Struggled" resets it to the 1-day interval. After clearing the 30-day interval once, a topic "graduates" and keeps repeating every 30 days rather than dropping out of rotation.
- **Topic capture** — subject, topic name, a list of subtopics, markdown notes (with fenced code blocks for Java/SQL/etc., syntax-highlighted), date learned, a 1–5 difficulty rating, and free-form tags.
- **Subtopic checklist** — each subtopic can be checked off individually, from the topic itself or from the dedicated **Checklist** tab, which lists every topic with pending subtopics first and fully-completed topics below — so you can see at a glance what's done for the day and what to pick up tomorrow. Subtopics can carry finer-grained child items (e.g. every item under a section heading); checking a subtopic checks all its children, and a subtopic auto-completes once every child is checked.
- **LLD/HLD Prerequisites** — seeded once under System Design: "LLD Prerequisites — Learn By Code Implementation" and "HLD Prerequisites — Mostly Conceptual", each with every section as a checkable subtopic and every item within it as a checkable child.
- **Editable subjects** — add, rename, or delete subjects at any time; deleting a subject with topics in it asks for confirmation first.
- **Daily goals** — set today's goals before you start studying, picking a subject and, where relevant, a sub-category: High-Level/Low-Level Design for System Design, a data structure like Linked Lists or Trees for Data Structures & Algorithms, or Computer Networks/Operating Systems/Database Management Systems for SWE Fundamentals — then the specific topic. Check them off through the day. A streak counter and a 35-day history grid make skipped days visible.
- **Default subjects** — ships with Java, Spring Boot, Data Structures & Algorithms, SWE Fundamentals, and System Design, all editable like any other subject.
- **Browse & search** — filter topics by subject, tag, difficulty, and date range; full-text search across topic names, subtopics, and notes. View any subject as a chronological list of everything covered.
- **Local-first data** — everything is stored in `localStorage`; export the full dataset as JSON and import it back in to back up or move between devices.

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (no external UI component library — everything is hand-built)
- `react-markdown` + `remark-gfm` + `rehype-highlight` for markdown notes with syntax-highlighted code blocks

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. To type-check and build for production:

```bash
npm run build
```

## Project structure

```
src/
  types.ts              Core data types (Subject, Topic, RevisionState, DailyGoal, ...)
  date.ts               Local-calendar-date helpers used by the scheduler
  spacedRepetition.ts   The revision scheduling engine
  storage.ts            localStorage persistence + JSON export/import
  index.css             Tailwind entry + markdown/code-block styling
  App.tsx               View state and top-level wiring
  components/
    Nav.tsx              Top navigation
    RevisePanel.tsx       The "Revise first" home panel
    TopicForm.tsx         Create/edit a topic
    TopicDetail.tsx       View a single topic, mark it reviewed, check off subtopics
    TopicList.tsx         Browse/search/filter, and per-subject chronological view
    Checklist.tsx         Cross-topic subtopic checklist (pending vs completed)
    DailyGoals.tsx        Today's goals, streak, and history grid
    Settings.tsx          Subject management, export/import
    Markdown.tsx          Markdown + syntax highlighting renderer
    ui.tsx                Shared UI primitives (button, input, modal, etc.)
```

## Data & privacy

Nothing leaves your browser. All topics, goals, and subjects are stored in `localStorage` under a single key. Use **Settings → Export JSON** to back up, and **Import JSON** to restore (this replaces the current data on that device).
