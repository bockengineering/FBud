#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / ".python_packages"))

from parsers.weapons_parser import WeaponsParser  # noqa: E402


def main() -> None:
    pdf_path = ROOT / "data" / "FY2027_Weapons.pdf"
    if not pdf_path.exists():
        raise SystemExit("Expected data/FY2027_Weapons.pdf. Copy the source PDF there and rerun.")

    parsed = WeaponsParser().parse(str(pdf_path))
    output_path = ROOT / "src" / "data" / "weapons-data.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "metadata": parsed.metadata,
        "mission_areas": parsed.mission_areas,
        "programs": parsed.programs,
        "funding_rows": parsed.funding_rows,
        "contractors": parsed.contractors,
        "document_chunks": parsed.chunks,
        "program_relationships": parsed.relationships,
        "budget_line_items": parsed.line_items,
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    pages = parsed.metadata["page_count"]
    programs = len(parsed.programs)
    mission_areas = len(parsed.mission_areas)
    funding_rows = len(parsed.funding_rows)
    review_rows = sum(1 for row in parsed.funding_rows if row.get("needs_review"))
    review_programs = sum(1 for program in parsed.programs if program.get("needs_review"))

    print("Ingest summary")
    print(f"- pages parsed: {pages}")
    print(f"- programs found: {programs}")
    print(f"- mission areas found: {mission_areas}")
    print(f"- funding rows found: {funding_rows}")
    print(f"- rows needing review: {review_rows}")
    print(f"- programs needing review: {review_programs}")
    print(f"- output: {output_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
