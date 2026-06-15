# SplitPro - Shared Expenses App

SplitPro is a premium, full-stack web application designed to solve messy shared expenses tracking. It supports complex split structures, time-bound memberships, debt simplification, and a robust legacy CSV ingestion engine.

## Live Deployment
- **URL:** [To be added by user after deployment]

## Prerequisites
- Node.js 20+
- npm

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   The application uses an embedded SQLite database. Run the following to set up the schema:
   ```bash
   npx prisma db push
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Testing the CSV Importer**
   - Click "Import Legacy Data" on the homepage.
   - The app will automatically ingest `expenses_export.csv` from the project root.
   - Review the generated **Anomaly Log Report** directly in the UI.
   - Navigate to **View Groups** to see the resolved balances ("Who pays whom") and the raw expense trace.

## Architecture & Technology
- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite (Relational DB)
- **ORM:** Prisma
- **Styling:** Vanilla CSS (CSS Modules & Variables)

## Provided Deliverables
- `SCOPE.md`: Database schema and anomaly detection policy log.
- `DECISIONS.md`: Log of technical and product decisions.
- `AI_USAGE.md`: Summary of AI prompts and corrected hallucinations.
- `Import Report`: Dynamically generated in the UI upon ingestion.
