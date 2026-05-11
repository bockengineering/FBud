# FBud

FBud is a dark, analyst-focused web app for navigating the FY2027 Department of War weapon-system budget. It turns the Weapons Book PDF into structured programs, mission areas, contractors, funding rows, source citations, and review queues.

## What is included

- Next.js App Router, TypeScript, Tailwind, shadcn/ui, Recharts
- Python PDF ingestion with PyMuPDF and Excel display ingestion with openpyxl
- Prisma schema and PostgreSQL migration for Supabase or local Postgres
- Dashboard, program explorer, RDT&E category map, budget-line explorer, manual curation workspace, program detail pages, mission-area pages, contractor pages, parser review, and sources
- Appropriations tracking from President's Budget request through House, Senate, conference, and final enacted amounts
- R-1, P-1, and O-1 display workbooks normalized into budget line items with program-line links
- Source-page citations and raw extracted text for auditability

## Setup

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run ingest:all
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Source Files

Place source files at:

```bash
data/FY2027_Weapons.pdf
data/r1_display.xlsx
data/p1_display.xlsx
data/o1_display.xlsx
```

The ingest commands parse the Weapons Book PDF and R-1/P-1/O-1 display workbooks, then write the normalized MVP seed artifact to:

```bash
src/data/weapons-data.json
```

This committed seed lets Vercel render the first version without private database credentials. The Prisma schema and migrations define the production Postgres/Supabase model for durable storage and future budget-document ingestion.

When `DATABASE_URL` is set and reachable, ingest commands also load the parsed data into Prisma/Postgres. To load the committed seed without reparsing source documents, run:

```bash
npm run db:seed
```

## Commands

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run ingest:weapons
npm run ingest:budget-lines
npm run ingest:all
npm run dev
npm run build
vercel deploy
```

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fbud"
NEXT_PUBLIC_APP_NAME="FBud"
```

`DATABASE_URL` is required for Prisma migrations against local Postgres or Supabase. The MVP UI reads from the generated JSON seed until the app is wired to a live database service.

## Ingestion Architecture

Parser interfaces live in `parsers/`:

- `base_parser.py`
- `weapons_parser.py`
- `r1_parser.py`
- `p1_parser.py`
- `o1_parser.py`

Each parser outputs a normalized shape containing document metadata, programs when available, line items, funding rows, contractors when available, source citations, raw text chunks, and parser confidence.

R-1, P-1, and O-1 display rows are stored as budget line items. The app preserves whether each row is included in TOA (`Y`/`Add`) or is a memo/non-add row, keeps the FY2025/FY2026/FY2027 display columns, and links high-confidence rows back to Weapons Book programs.

## Manual Curation

Open `/curation` to review and override line-item links. The curation workspace can:

- link or unlink R-1/P-1/O-1 rows to Weapons Book programs
- override a parsed line-item name or service/agency label
- mark a row reviewed or needing review
- store analyst notes
- export/import the override JSON

In the current MVP, curation overrides are browser-local so the public app can run without auth or write access. Export the override JSON to preserve or share analyst edits. A future database-backed admin mode should persist these same overrides in Postgres.

## Budget Logic Notes

- FY2025 is treated as actual execution/actuals.
- FY2026 is treated as enacted/current funding when indicated by the document.
- FY2027 is treated as the President's Budget request.
- Program funding is not contract awards.
- Contractor pages use "associated program funding" and do not imply contractor revenue.

## Future Sources

The next logical sources are the RDT&E and procurement justification books. They should add narrative detail, project numbers, budget activities, account-level context, and stronger line-item links beneath the existing R-1/P-1 display rows.

Legislative tracking sources should follow as soon as they are published:

- House Appropriations and authorization marks
- Senate Appropriations and authorization marks
- Committee reports and tables
- Conference / Joint Explanatory Statement
- Public law and enacted account-level tables

These records should populate `legislative_documents` and `appropriation_marks`, linking each mark to a Weapons Book program or future R-1/P-1/O-1 budget line item.
