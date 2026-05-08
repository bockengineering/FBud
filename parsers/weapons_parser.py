from __future__ import annotations

import json
import math
import re
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import fitz

from .base_parser import BudgetParser, ParsedDocument


MISSION_ALIASES = [
    ("Aircraft", "Aircraft"),
    ("C4I Systems", "Command, Control, Communications, Computers, and Intelligence Systems, C4I"),
    ("Ground Systems", "Ground Systems"),
    ("Missile Defense Programs", "Missile Defense Programs"),
    ("Missiles and Munitions", "Missiles and Munitions"),
    ("Shipbuilding and Maritime Systems", "Shipbuilding and Maritime Systems"),
    ("Space Based Systems", "Space Based Systems"),
    ("Hypersonic Warfare", "Hypersonics"),
]

KEYWORDS = [
    "hypersonic",
    "missile defense",
    "unmanned",
    "autonomous",
    "satellite communications",
    "shipbuilding",
    "munitions",
    "air defense",
    "isr",
    "submarine",
    "aircraft",
    "radar",
    "space",
    "strike",
    "deterrence",
]


def slugify(value: str) -> str:
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return re.sub(r"-+", "-", value).strip("-") or "item"


def clean_text(value: str) -> str:
    value = re.sub(r"[ \t]+", " ", value.replace("\xa0", " "))
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def amount(value: str) -> Optional[float]:
    value = value.strip()
    if not value or value == "-":
        return 0.0
    try:
        return float(value.replace(",", ""))
    except ValueError:
        return None


def mission_from_heading(line: str) -> Optional[Tuple[str, str]]:
    normalized = line.replace("–", "-")
    for prefix, mission in MISSION_ALIASES:
        if normalized.startswith(prefix + " -"):
            return mission, normalized.split("-", 1)[1].strip()
    return None


def normalize_service(service: str) -> str:
    service = service.strip()
    replacements = {
        "Joint Service": "Joint Service",
        "US Army (USA)": "US Army",
        "USA": "US Army",
        "USN": "US Navy",
        "USMC": "US Marine Corps",
        "US Air Force (USAF)": "US Air Force",
        "USAF": "US Air Force",
        "USAF/SF": "US Air Force / Space Force",
    }
    return replacements.get(service, service)


def parse_amount_tokens(lines: List[str]) -> Tuple[List[str], List[float]]:
    name_lines: List[str] = []
    values: List[float] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if re.fullmatch(r"-|[0-9][0-9,]*\.[0-9]", stripped):
            parsed = amount(stripped)
            if parsed is not None:
                values.append(parsed)
        else:
            name_lines.append(stripped)
    return name_lines, values


def extract_companies(raw: str) -> List[Dict[str, str]]:
    raw = clean_text(raw)
    if not raw:
        return []
    candidates = []
    for line in re.split(r"\n| {2,}", raw):
        line = line.strip(" ;")
        if not line:
            continue
        for role_prefix in ["Airframe:", "Engine:", "Ground System:", "Interceptor:", "Launcher:"]:
            line = line.replace(role_prefix, role_prefix + " ")
        pieces = re.split(r"\)\s+and\s+| and (?=[A-Z][A-Za-z0-9& -]+(?:Corporation|Corp|Company|Systems|Defense|Industries|Technologies|Missiles|Martin|Boeing|RTX|Harris|Dynamics))", line)
        candidates.extend(pieces)
    companies = []
    seen = set()
    for item in candidates:
        role = "prime"
        if ":" in item and item.index(":") < 24:
            role, item = [part.strip() for part in item.split(":", 1)]
            role = role.lower()
        name = item.split(";")[0].strip(" ()")
        name = re.sub(r"^(Prime Contractor\(s\):|Prime Contractor:)\s*", "", name).strip()
        if not name or len(name) < 3:
            continue
        if name.lower().startswith(("waco,", "orlando,", "tucson,", "newport", "bethesda", "arlington")):
            continue
        if name not in seen:
            companies.append({"name": name, "role": role})
            seen.add(name)
    return companies[:8]


def find_section(text: str, start_label: str, end_labels: Iterable[str]) -> str:
    start = re.search(re.escape(start_label) + r"\s*", text, flags=re.I)
    if not start:
        return ""
    tail = text[start.end() :]
    end_positions = []
    for label in end_labels:
        match = re.search(re.escape(label), tail, flags=re.I)
        if match:
            end_positions.append(match.start())
    end = min(end_positions) if end_positions else len(tail)
    return clean_text(tail[:end])


def find_table_segment(text: str, label: str, next_labels: Iterable[str]) -> str:
    matches = list(re.finditer(rf"(?m)^\s*{re.escape(label)}\s*$", text, flags=re.I))
    if not matches:
        return ""
    start = matches[-1].end()
    tail = text[start:]
    end = len(tail)
    for next_label in next_labels:
        match = re.search(rf"(?m)^\s*{re.escape(next_label)}\s*$", tail, flags=re.I)
        if match:
            end = min(end, match.start())
    return tail[:end]


def row_amounts(segment: str) -> Optional[Dict[str, float]]:
    tokens = re.findall(r"-|[0-9][0-9,]*\.[0-9]", segment)
    if len(tokens) < 14:
        return None
    tokens = tokens[-14:]
    values = [amount(tokens[index]) for index in [1, 7, 9, 11, 13]]
    if any(value is None for value in values):
        return None
    return {
        "fy2025_total": values[0] or 0.0,
        "fy2026_total": values[1] or 0.0,
        "fy2027_discretionary": values[2] or 0.0,
        "fy2027_mandatory": values[3] or 0.0,
        "fy2027_total": values[4] or 0.0,
    }


class WeaponsParser(BudgetParser):
    document_type = "weapons_book"

    def parse(self, pdf_path: str) -> ParsedDocument:
        doc = fitz.open(pdf_path)
        pages = [page.get_text("text") for page in doc]
        toc_programs = self._parse_summary_pages(pages[3:5])
        page_index = self._build_page_index(pages)

        mission_totals: Dict[str, Dict[str, Any]] = {}
        programs: List[Dict[str, Any]] = []
        funding_rows: List[Dict[str, Any]] = []
        chunks: List[Dict[str, Any]] = []
        contractors_by_name: Dict[str, Dict[str, Any]] = {}

        for raw_program in toc_programs:
            page_label = raw_program["page_label"]
            physical_page = page_index.get(page_label)
            source_text = pages[physical_page - 1] if physical_page else ""
            enriched = self._enrich_program(raw_program, source_text, physical_page)
            programs.append(enriched)
            chunks.extend(self._chunks(enriched))
            funding_rows.extend(self._funding_rows(enriched, source_text))
            for contractor in enriched["prime_contractors"]:
                normalized = contractor["name"].lower().replace("&", "and")
                contractors_by_name.setdefault(
                    normalized,
                    {
                        "id": slugify(contractor["name"]),
                        "name": contractor["name"],
                        "normalized_name": normalized,
                        "location": "",
                    },
                )

            mission = enriched["mission_area"]
            summary = mission_totals.setdefault(
                mission,
                {
                    "id": slugify(mission),
                    "name": mission,
                    "description": "",
                    "fy2027_total_amount_millions": 0.0,
                    "historical_funding_json": {},
                    "source_page": "",
                },
            )
            summary["fy2027_total_amount_millions"] += enriched["computed"]["fy2027_total"]
            if not summary["source_page"] and page_label:
                summary["source_page"] = page_label.rsplit("-", 1)[0] + "-1"

        for rank, program in enumerate(sorted(programs, key=lambda p: p["computed"]["fy2027_total"], reverse=True), start=1):
            program["computed"]["rank_by_fy2027_total"] = rank
        growth_sorted = sorted(programs, key=lambda p: p["computed"]["absolute_change_26_to_27"], reverse=True)
        for rank, program in enumerate(growth_sorted, start=1):
            program["computed"]["rank_by_growth_26_to_27"] = rank

        relationships = self._relationships(programs)
        return ParsedDocument(
            metadata={
                "id": "fy2027-weapons",
                "title": "FY 2027 Department of War Budget, Program Acquisition Cost by Weapon System",
                "fiscal_year": 2027,
                "source_filename": Path(pdf_path).name,
                "source_type": "weapons_book",
                "document_type": "weapons_book",
                "page_count": doc.page_count,
            },
            mission_areas=sorted(mission_totals.values(), key=lambda item: item["name"]),
            programs=programs,
            funding_rows=funding_rows,
            contractors=sorted(contractors_by_name.values(), key=lambda item: item["name"]),
            chunks=chunks,
            relationships=relationships,
        )

    def _parse_summary_pages(self, summary_pages: List[str]) -> List[Dict[str, Any]]:
        programs = []
        current_mission = ""
        current_service = ""
        buffer: List[str] = []
        for line in "\n".join(summary_pages).splitlines():
            line = clean_text(line)
            if not line:
                continue
            heading = mission_from_heading(line)
            if heading:
                current_mission, current_service = heading
                current_service = normalize_service(current_service)
                buffer = []
                continue
            if "Introduction" in line or line in {
                "($ in Millions)",
                "FY 2025",
                "FY 2026",
                "FY 2027",
                "Page",
                "Major Weapon Systems Summary",
                "Major Weapon System Introduction",
                "Summary of Account History",
                "Overview",
                "i",
                "ii",
                "iii",
                "ix",
            }:
                buffer = []
                continue
            if re.fullmatch(r"\d-\d+", line):
                names, values = parse_amount_tokens(buffer)
                buffer = []
                if len(values) >= 3 and names and current_mission:
                    short = names[0]
                    if short.endswith(("and", "/", "and ")):
                        short = " ".join(names[:2])
                    program_title = " ".join(names)
                    programs.append(
                        {
                            "id": slugify(f"{short}-{line}"),
                            "name": program_title,
                            "short_name": short,
                            "mission_area": current_mission,
                            "service_or_component": current_service,
                            "page_label": line,
                            "summary_totals": {
                                "fy2025_total": values[-3],
                                "fy2026_total": values[-2],
                                "fy2027_total": values[-1],
                            },
                        }
                    )
                continue
            buffer.append(line)
        return programs

    def _build_page_index(self, pages: List[str]) -> Dict[str, int]:
        index = {}
        for page_number, text in enumerate(pages, start=1):
            top = "\n".join(text.splitlines()[:8])
            for match in re.finditer(r"(?m)^\s*(\d-\d+)\s*$", top):
                index[match.group(1)] = page_number
        return index

    def _enrich_program(self, raw: Dict[str, Any], text: str, physical_page: Optional[int]) -> Dict[str, Any]:
        page_label = raw["page_label"]
        after_label = text.split(page_label, 1)[1] if page_label and page_label in text else text
        description = clean_text(after_label.split("Mission:", 1)[0])
        mission = find_section(after_label, "Mission:", ["FY 2027 Program:"])
        fy_program = find_section(after_label, "FY 2027 Program:", ["Prime Contractor(s):", "Prime Contractor:"])
        contractors_raw = find_section(after_label, "Prime Contractor(s):", ["Note:", "Numbers may", "Qty", "RDT&E"])
        if not contractors_raw:
            contractors_raw = find_section(after_label, "Prime Contractor:", ["Note:", "Numbers may", "Qty", "RDT&E"])
        notes = find_section(after_label, "Note:", ["Numbers may", "Qty", "RDT&E"])
        prime_contractors = extract_companies(contractors_raw)
        table_text = text[text.find("RDT&E") :] if "RDT&E" in text else ""
        rdte = row_amounts(find_table_segment(table_text, "Subtotal", ["Procurement", "Total"])) or row_amounts(find_table_segment(table_text, "RDT&E", ["Procurement", "Total"]))
        procurement = row_amounts(find_table_segment(table_text, "Procurement", ["Total"]))
        totals = raw["summary_totals"]
        computed = self._computed(totals, rdte, procurement)
        needs_review = not text or not mission or not fy_program or not prime_contractors or rdte is None or procurement is None
        return {
            "id": raw["id"],
            "document_id": "fy2027-weapons",
            "mission_area": raw["mission_area"],
            "mission_area_id": slugify(raw["mission_area"]),
            "name": raw["name"],
            "short_name": raw["short_name"],
            "service_or_component": raw["service_or_component"],
            "page_label": page_label,
            "pdf_page_number": physical_page,
            "description": description,
            "mission": mission,
            "fy2027_program_summary": fy_program,
            "prime_contractors": prime_contractors,
            "notes": notes,
            "source_text": clean_text(text),
            "raw_table_text": clean_text(table_text),
            "confidence_score": 0.72 if needs_review else 0.93,
            "needs_review": needs_review,
            "keywords": [keyword for keyword in KEYWORDS if keyword in text.lower()],
            "computed": computed,
        }

    def _computed(self, totals: Dict[str, float], rdte: Optional[Dict[str, float]], procurement: Optional[Dict[str, float]]) -> Dict[str, float]:
        fy2025 = totals["fy2025_total"]
        fy2026 = totals["fy2026_total"]
        fy2027 = totals["fy2027_total"]
        fy2027_rdte = rdte["fy2027_total"] if rdte else 0.0
        fy2027_proc = procurement["fy2027_total"] if procurement else 0.0
        mandatory = (rdte["fy2027_mandatory"] if rdte else 0.0) + (procurement["fy2027_mandatory"] if procurement else 0.0)
        return {
            "fy2025_total": fy2025,
            "fy2026_total": fy2026,
            "fy2027_total": fy2027,
            "fy2025_rdte": rdte["fy2025_total"] if rdte else 0.0,
            "fy2026_rdte": rdte["fy2026_total"] if rdte else 0.0,
            "fy2027_rdte": fy2027_rdte,
            "fy2025_procurement": procurement["fy2025_total"] if procurement else 0.0,
            "fy2026_procurement": procurement["fy2026_total"] if procurement else 0.0,
            "fy2027_procurement": fy2027_proc,
            "absolute_change_26_to_27": fy2027 - fy2026,
            "percent_change_26_to_27": ((fy2027 - fy2026) / fy2026 * 100.0) if fy2026 else 0.0,
            "absolute_change_25_to_27": fy2027 - fy2025,
            "percent_change_25_to_27": ((fy2027 - fy2025) / fy2025 * 100.0) if fy2025 else 0.0,
            "rdte_share_fy2027": (fy2027_rdte / fy2027 * 100.0) if fy2027 else 0.0,
            "procurement_share_fy2027": (fy2027_proc / fy2027 * 100.0) if fy2027 else 0.0,
            "mandatory_share_fy2027": (mandatory / fy2027 * 100.0) if fy2027 else 0.0,
            "rank_by_fy2027_total": 0,
            "rank_by_growth_26_to_27": 0,
        }

    def _funding_rows(self, program: Dict[str, Any], text: str) -> List[Dict[str, Any]]:
        rows = []
        computed = program["computed"]
        for year, stage in [(2025, "actual"), (2026, "enacted"), (2027, "request")]:
            for funding_type, key in [
                ("RDT&E", f"fy{year}_rdte"),
                ("Procurement", f"fy{year}_procurement"),
                ("Total", f"fy{year}_total"),
            ]:
                value = computed.get(key, 0.0)
                rows.append(
                    {
                        "id": slugify(f"{program['id']}-{year}-{funding_type}"),
                        "program_id": program["id"],
                        "fiscal_year": year,
                        "funding_stage": stage,
                        "funding_type": funding_type,
                        "discretionary_amount_millions": value if year == 2027 and computed.get("mandatory_share_fy2027", 0) == 0 else None,
                        "mandatory_amount_millions": None,
                        "total_amount_millions": value,
                        "quantity": None,
                        "service_or_component": program["service_or_component"],
                        "line_item_name": program["name"],
                        "source_page": program["page_label"],
                        "raw_table_text": program["raw_table_text"],
                        "confidence_score": 0.95 if funding_type == "Total" else program["confidence_score"],
                        "needs_review": funding_type != "Total" and program["needs_review"],
                    }
                )
        return rows

    def _chunks(self, program: Dict[str, Any]) -> List[Dict[str, Any]]:
        chunks = []
        for chunk_type, field in [
            ("description", "description"),
            ("mission", "mission"),
            ("fy2027_program", "fy2027_program_summary"),
            ("prime_contractors", "prime_contractors"),
            ("funding_table", "raw_table_text"),
        ]:
            text = json.dumps(program[field]) if isinstance(program[field], list) else program[field]
            chunks.append(
                {
                    "id": slugify(f"{program['id']}-{chunk_type}"),
                    "program_id": program["id"],
                    "mission_area_id": program["mission_area_id"],
                    "page_number": program["pdf_page_number"],
                    "chunk_type": chunk_type,
                    "text": text,
                }
            )
        return chunks

    def _relationships(self, programs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        relationships = []
        for source in programs:
            scored = []
            source_contractors = {c["name"].lower() for c in source["prime_contractors"]}
            for target in programs:
                if source["id"] == target["id"]:
                    continue
                score = 0
                reasons = []
                target_contractors = {c["name"].lower() for c in target["prime_contractors"]}
                if source["mission_area_id"] == target["mission_area_id"]:
                    score += 5
                    reasons.append("same_mission_area")
                if source_contractors & target_contractors:
                    score += 4
                    reasons.append("same_contractor")
                if source["service_or_component"] and source["service_or_component"] == target["service_or_component"]:
                    score += 3
                    reasons.append("same_service")
                shared_keywords = set(source["keywords"]) & set(target["keywords"])
                if shared_keywords:
                    score += 3
                    reasons.append("similar_keyword")
                if abs(source["computed"]["fy2027_total"] - target["computed"]["fy2027_total"]) < max(source["computed"]["fy2027_total"], 1) * 0.25:
                    score += 2
                    reasons.append("similar_funding_size")
                if source["computed"]["absolute_change_26_to_27"] * target["computed"]["absolute_change_26_to_27"] > 0:
                    score += 2
                    reasons.append("similar_funding_pattern")
                if abs(source["computed"]["rdte_share_fy2027"] - target["computed"]["rdte_share_fy2027"]) < 15:
                    score += 2
                    reasons.append("similar_rdte_mix")
                if score:
                    scored.append((score, target, reasons))
            for score, target, reasons in sorted(scored, key=lambda item: item[0], reverse=True)[:12]:
                relationships.append(
                    {
                        "id": slugify(f"{source['id']}-{target['id']}-{reasons[0]}"),
                        "source_program_id": source["id"],
                        "target_program_id": target["id"],
                        "relationship_type": reasons[0],
                        "score": score,
                        "explanation": ", ".join(reasons).replace("_", " "),
                    }
                )
        return relationships
