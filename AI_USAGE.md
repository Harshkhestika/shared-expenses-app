# AI Usage & Corrections

## Tools Used
- Gemini 3.1 Pro (High) functioning as an agentic coding assistant within the Google IDE.

## Key Prompts
- "Create a robust Next.js API route that parses TSV data and detects the 12 specific anomalies listed, ensuring database consistency."
- "Write a TypeScript function to simplify group debts to the minimum number of transactions (the 'Who pays whom' feature)."
- "Scaffold a premium Next.js layout using Vanilla CSS and CSS variables without using TailwindCSS."

## AI Corrections & Catching Mistakes

1. **Incorrect Date Parsing logic for `Mar-14`:**
   - **Error:** The AI initially used standard JavaScript `new Date('Mar-14')`, which parses inconsistently across environments, often resulting in year 2001.
   - **Fix:** I caught this via test runs and changed the logic to explicitly split and map `Mar-14` to `14-03-2026` before passing it to the database Date object.

2. **Prisma 7 Compatibility issues:**
   - **Error:** The AI updated the Prisma CLI to version 7.8.0 but wrote the schema and `new PrismaClient()` using Prisma 5 conventions, causing a build failure because `datasourceUrl` is no longer supported in the schema in v7 without specific adapters.
   - **Fix:** I identified the version mismatch and explicitly downgraded the dependencies to `prisma@5` and `@prisma/client@5` to maintain stability and restore the standard `env("DATABASE_URL")` usage in `schema.prisma`.

3. **Percentage Normalization:**
   - **Error:** The AI wrote logic that accepted the 110% sum (30+30+30+20) and created splits based on `amount * (pct / 100)`. This would create money out of thin air.
   - **Fix:** I revised the algorithm to sum the given percentages and normalize them by dividing each by the total (e.g., `30 / 110`), ensuring the splits always sum exactly to the expense amount.
