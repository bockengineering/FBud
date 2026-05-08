# FBud

FBud is a dark, analyst-focused web app for navigating the FY2027 Department of War weapon-system budget. It turns the Weapons Book PDF into structured programs, mission areas, contractors, funding rows, source citations, and review queues.

## What is included

- Next.js App Router, TypeScript, Tailwind, shadcn/ui, Recharts
- Python PDF ingestion with PyMuPDF
- Prisma schema and PostgreSQL migration for Supabase or local Postgres
- Dashboard, program explorer, program detail pages, mission-area pages, contractor pages, parser review, and sources
- Appropriations tracking from President's Budget request through House, Senate, conference, and final enacted amounts
- Future-ready tables for R-1, P-1, O-1, justification books, budget line items, and program-line links
- Source-page citations and raw extracted text for auditability

## Setup

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run ingest:weapons
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Source PDF

Place the source file at:

```bash
data/FY2027_Weapons.pdf
```

The ingest command parses the PDF page by page and writes the normalized MVP seed artifact to:

```bash
src/data/weapons-data.json
```

This committed seed lets Vercel render the first version without private database credentials. The Prisma schema and migrations define the production Postgres/Supabase model for durable storage and future budget-document ingestion.

When `DATABASE_URL` is set and reachable, `npm run ingest:weapons` also loads the parsed data into Prisma/Postgres. To load the committed seed without reparsing the PDF, run:

```bash
npm run db:seed
```

## Commands

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run ingest:weapons
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

Each parser is intended to output a normalized shape containing document metadata, programs, line items, funding rows, contractors, source citations, raw text chunks, and parser confidence.

## Budget Logic Notes

- FY2025 is treated as actual execution/actuals.
- FY2026 is treated as enacted/current funding when indicated by the document.
- FY2027 is treated as the President's Budget request.
- Program funding is not contract awards.
- Contractor pages use "associated program funding" and do not imply contractor revenue.

## Future Sources

The next logical sources are R-1 and P-1 documents. R-1 should add RDT&E program elements, budget activities, project numbers, and justification-book links. P-1 should add procurement line numbers, quantities, and appropriation-account depth.

Legislative tracking sources should follow as soon as they are published:

- House Appropriations and authorization marks
- Senate Appropriations and authorization marks
- Committee reports and tables
- Conference / Joint Explanatory Statement
- Public law and enacted account-level tables

These records should populate `legislative_documents` and `appropriation_marks`, linking each mark to a Weapons Book program or future R-1/P-1/O-1 budget line item.
