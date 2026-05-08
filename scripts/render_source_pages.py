#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".python_packages"))

import fitz  # noqa: E402


def main() -> None:
    pdf_path = ROOT / "data" / "FY2027_Weapons.pdf"
    output_dir = ROOT / "public" / "source-pages"
    if not pdf_path.exists():
        raise SystemExit("Expected data/FY2027_Weapons.pdf")
    output_dir.mkdir(parents=True, exist_ok=True)

    document = fitz.open(pdf_path)
    matrix = fitz.Matrix(1.75, 1.75)
    for index, page in enumerate(document, start=1):
        output_path = output_dir / f"page-{index}.jpg"
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        pixmap.save(output_path)

    print(f"Rendered {document.page_count} source page images to {output_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
