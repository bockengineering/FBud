from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ParsedDocument:
    metadata: Dict[str, Any]
    mission_areas: List[Dict[str, Any]] = field(default_factory=list)
    programs: List[Dict[str, Any]] = field(default_factory=list)
    funding_rows: List[Dict[str, Any]] = field(default_factory=list)
    contractors: List[Dict[str, Any]] = field(default_factory=list)
    chunks: List[Dict[str, Any]] = field(default_factory=list)
    relationships: List[Dict[str, Any]] = field(default_factory=list)
    line_items: List[Dict[str, Any]] = field(default_factory=list)


class BudgetParser:
    document_type = "unknown"

    def parse(self, pdf_path: str) -> ParsedDocument:
        raise NotImplementedError
