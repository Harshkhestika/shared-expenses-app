# Decisions Log

### 1. Database & ORM
- **Decision:** SQLite with Prisma ORM.
- **Options Considered:** PostgreSQL, MySQL, direct SQL queries.
- **Reason:** Meets the "relational DBs only" requirement while offering a zero-config local environment, allowing the evaluator to run the app immediately without setting up a database server. Prisma provides type safety and rapid schema prototyping.

### 2. Full-stack Framework
- **Decision:** Next.js (App Router).
- **Options Considered:** Express + React, Vite + Python/FastAPI.
- **Reason:** Next.js App Router unifies the frontend and backend in one repository, dramatically speeding up development time (2-day constraint) and simplifying deployment (e.g. Vercel).

### 3. CSV Import Policy - Conflicting Duplicates
- **Decision:** Skip Aisha's conflicting Thalassa dinner entry.
- **Options Considered:** Average the two amounts, or prompt the user.
- **Reason:** The prompt demands automated handling based on policies. The notes explicitly indicate "hers is wrong". The importer searches for such notes to resolve conflicts silently but explicitly logs it in the Anomaly Report.

### 4. CSV Import Policy - Balances engine ("Who pays whom")
- **Decision:** Minimize transaction graph.
- **Options Considered:** Direct graph mapping (who specifically owes whom).
- **Reason:** Aisha specifically requested "Who pays whom, how much, done" with one number per person. A debt simplification algorithm computes net balances and then pairs the biggest debtors with the biggest creditors.

### 5. CSV Import Policy - Date Parsing Ambiguity
- **Decision:** Parse `04-05-2026` as April 5th.
- **Options Considered:** Prompt user, discard row, or strict DD-MM.
- **Reason:** Given the chronological sequence of the legacy CSV (Feb -> March -> April 2 -> April 5 -> April 8), it's statistically certain this means April 5th. The importer enforces this contextual rule to prevent broken timelines.
