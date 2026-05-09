from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from parsers.o1_parser import O1Parser
from parsers.p1_parser import P1Parser
from parsers.r1_parser import R1Parser


SEED_PATH = ROOT / "src" / "data" / "weapons-data.json"
WORKBOOKS = [
    (R1Parser(), ROOT / "data" / "r1_display.xlsx"),
    (P1Parser(), ROOT / "data" / "p1_display.xlsx"),
    (O1Parser(), ROOT / "data" / "o1_display.xlsx"),
]

STOP_ALIASES = {
    "and",
    "program",
    "support",
    "aircraft",
    "system",
    "systems",
    "missile",
    "weapon",
    "weapons",
    "class",
    "family",
    "future",
    "launch",
    "auxiliary",
}

MANUAL_ALIASES = {
    "f-35-1-2": ["F-35", "Joint Strike Fighter", "JSF", "F35"],
    "v-22-1-3": ["V-22", "Osprey", "CMV-22", "CV-22", "MV-22"],
    "c-130j-1-4": ["C-130J", "HC/MC-130J", "KC-130J", "C130J"],
    "mq-1c-1-5": ["MQ-1C", "Gray Eagle", "MQ-1 UAV"],
    "mq-9-1-6": ["MQ-9", "Reaper"],
    "mq-4c-rq-4-1-7": ["MQ-4C", "RQ-4", "Triton", "Global Hawk", "NATO AGS"],
    "flraa-1-12": ["FLRAA", "Future Long Range Assault Aircraft"],
    "mq-25-1-13": ["MQ-25", "Stingray"],
    "f-a-18-1-14": ["F/A-18", "F-18", "Super Hornet"],
    "e-2d-1-15": ["E-2D", "Advanced Hawkeye"],
    "ch-53k-1-16": ["CH-53K", "Heavy Lift Replacement"],
    "b-21-1-17": ["B-21", "Raider", "Long Range Strike Bomber"],
    "kc-46a-1-19": ["KC-46A", "Pegasus"],
    "vc-25b-1-20": ["VC-25B", "Presidential Aircraft Recapitalization"],
    "f-47-1-21": ["F-47", "Next Generation Air Dominance", "NGAD"],
    "f-22-1-22": ["F-22", "Raptor"],
    "f-15-1-23": ["F-15", "Eagle II"],
    "t-7a-1-25": ["T-7A", "Advanced Pilot Training"],
    "mh-139a-1-26": ["MH-139A", "Grey Wolf"],
    "cca-1-27": ["CCA", "Collaborative Combat Aircraft"],
    "jltv-3-2": ["JLTV", "Joint Light Tactical Vehicle"],
    "m-1-3-3": ["M-1", "Abrams"],
    "ampv-3-4": ["AMPV", "Armored Multi-Purpose Vehicle"],
    "ngsw-3-5": ["NGSW", "Next Generation Squad Weapon"],
    "pim-3-6": ["PIM", "Paladin Integrated Management"],
    "stryker-3-7": ["Stryker"],
    "fmtv-3-8": ["FMTV", "Family of Medium Tactical Vehicles"],
    "fhtv-3-9": ["FHTV", "Family of Heavy Tactical Vehicles"],
    "xm30-3-10": ["XM30", "Optionally Manned Fighting Vehicle"],
    "acv-3-11": ["ACV", "Amphibious Combat Vehicle"],
    "gmd-4-2": ["GMD", "Ground-based Midcourse Defense", "Ground Based Midcourse Defense"],
    "thaad-4-3": ["THAAD", "Terminal High Altitude Area Defense"],
    "aegis-4-4": ["Aegis", "Aegis BMD"],
    "patriot-pac-3-4-5": ["PATRIOT", "PAC-3", "Patriot Advanced Capability"],
    "pac-3-mse-4-6": ["PAC-3 MSE", "Missile Segment Enhancement"],
    "ifpc-4-7": ["IFPC", "Indirect Fire Protection Capability"],
    "mric-4-8": ["MRIC", "Medium Range Intercept Capability"],
    "jdam-5-2": ["JDAM", "Joint Direct Attack Munition"],
    "sdb-i-5-3": ["SDB I", "Small Diameter Bomb I"],
    "sdb-ii-5-4": ["SDB II", "Small Diameter Bomb II", "StormBreaker"],
    "jassm-5-5": ["JASSM", "Joint Air-to-Surface Standoff Missile"],
    "aim-9x-5-6": ["AIM-9X", "Sidewinder"],
    "amraam-5-7": ["AMRAAM", "AIM-120", "Advanced Medium Range Air-to-Air Missile"],
    "jagm-5-8": ["JAGM", "Joint Air-to-Ground Missile"],
    "lrasm-5-9": ["LRASM", "Long Range Anti-Ship Missile"],
    "ammo-5-10": ["AMMO", "Ammunition"],
    "aargm-er-and-siaw-5-11": ["AARGM-ER", "SiAW", "Stand-in Attack Weapon"],
    "gmlrs-5-12": ["GMLRS", "Guided Multiple Launch Rocket System"],
    "javelin-5-13": ["Javelin"],
    "prsm-5-14": ["PrSM", "Precision Strike Missile"],
    "smrf-typhon-5-15": ["Typhon", "Strategic Mid-Range Fires", "SMRF"],
    "trident-ii-5-16": ["Trident II", "Trident II D5", "SLBM"],
    "sm-6-5-17": ["SM-6", "Standard Missile-6"],
    "ram-5-18": ["RAM", "Rolling Airframe Missile"],
    "nsm-5-19": ["NSM", "Naval Strike Missile"],
    "tomahawk-5-20": ["Tomahawk"],
    "mace-5-21": ["MACE", "Multi-Mission Affordable Capacity Effector"],
    "lgm-35a-5-22": ["LGM-35A", "Sentinel", "Ground Based Strategic Deterrent", "GBSD"],
    "lrso-5-23": ["LRSO", "Long Range Stand-Off"],
    "famm-5-24": ["FAMM", "Family of Affordable Mass Munitions"],
    "ssbn-826-6-4": ["SSBN 826", "Columbia Class", "Columbia"],
    "ssn-774-6-5": ["SSN 774", "Virginia Class", "Virginia"],
    "cvn-78-6-6": ["CVN 78", "Gerald R. Ford", "Ford Class"],
    "ddg-51-6-8": ["DDG 51", "Arleigh Burke"],
    "lpd-17-6-9": ["LPD 17", "San Antonio"],
    "lha-6-10": ["LHA", "America Class"],
    "lsm-6-11": ["LSM", "Medium Landing Ship"],
    "t-ao-205-6-12": ["T-AO 205", "John Lewis"],
    "usv-6-15": ["USV", "Unmanned Surface Vessel"],
    "launch-7-2": ["Launch Enterprise", "National Security Space Launch", "NSSL"],
    "pnt-7-3": ["PNT", "Positioning Navigation and Timing", "GPS"],
    "mw-mt-7-4": ["MW/MT", "Missile Warning", "Missile Tracking"],
    "satcom-7-5": ["SATCOM", "Satellite Communications"],
    "hypersonic-defenses-hypersonic-defense-8-2": ["Hypersonic Defense", "Glide Phase Interceptor", "GPI", "HBTSS"],
    "lrhw-8-3": ["LRHW", "Long Range Hypersonic Weapon"],
    "cps-8-4": ["CPS", "Conventional Prompt Strike"],
    "hacm-8-5": ["HACM", "Hypersonic Attack Cruise Missile"],
}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def compact(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def service_matches(program_service: str, line_service: str | None) -> bool:
    if not line_service:
        return False
    service = line_service.lower()
    program = program_service.lower()
    if "joint" in program:
        return False
    for token in ["army", "navy", "marine", "air force", "space force", "defense-wide"]:
        if token in program and token in service:
            return True
    return False


def split_alias_parts(value: str) -> list[str]:
    parts = re.split(r"/|,|\band\b|\(|\)|:", value)
    return [part.strip() for part in parts if part and part.strip()]


def program_aliases(program: dict[str, Any]) -> list[str]:
    aliases: set[str] = set(MANUAL_ALIASES.get(program["id"], []))
    for value in [program.get("short_name", ""), program.get("name", "")]:
        for part in split_alias_parts(str(value)):
            clean = normalize(part)
            if len(clean) < 3 or clean in STOP_ALIASES:
                continue
            if len(clean) <= 4 and clean.isalpha() and clean.lower() in STOP_ALIASES:
                continue
            aliases.add(part)
    return sorted(aliases, key=len, reverse=True)


def alias_hit(alias: str, haystack_norm: str, haystack_compact: str) -> bool:
    alias_norm = normalize(alias)
    alias_compact = compact(alias)
    if not alias_norm or alias_norm in STOP_ALIASES:
        return False
    if any(char.isdigit() for char in alias_compact):
        return alias_compact in haystack_compact
    if len(alias_compact) <= 4:
        return re.search(rf"\b{re.escape(alias_norm)}\b", haystack_norm) is not None
    return alias_norm in haystack_norm


def score_program_line(program: dict[str, Any], line_item: dict[str, Any]) -> tuple[int, list[str], str]:
    title = str(line_item.get("line_item_name") or "")
    haystack = " ".join(
        [
            title,
            str(line_item.get("program_element") or ""),
            str(line_item.get("account_title") or ""),
            str(line_item.get("budget_activity_name") or ""),
            str(line_item.get("budget_subactivity_name") or ""),
        ],
    )
    haystack_norm = normalize(haystack)
    haystack_compact = compact(haystack)
    hits: list[str] = []
    score = 0
    relationship_type = "fuzzy_name_match"
    manual_set = set(MANUAL_ALIASES.get(program["id"], []))

    for alias in program_aliases(program):
        if alias_hit(alias, haystack_norm, haystack_compact):
            hits.append(alias)
            alias_score = 9 if any(char.isdigit() for char in compact(alias)) else 7
            if alias in manual_set:
                alias_score += 2
                relationship_type = "manual_alias"
            if compact(alias) == compact(program.get("short_name", "")):
                relationship_type = "direct_match"
            score += alias_score
            break

    if score and service_matches(str(program.get("service_or_component") or ""), line_item.get("service_or_component")):
        score += 2
    return score, hits, relationship_type


def build_program_line_links(programs: list[dict[str, Any]], line_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    links: list[dict[str, Any]] = []
    for item in line_items:
        candidates: list[tuple[int, dict[str, Any], list[str], str]] = []
        for program in programs:
            score, hits, relationship_type = score_program_line(program, item)
            if score >= 8:
                candidates.append((score, program, hits, relationship_type))
        if not candidates:
            continue
        score, program, hits, relationship_type = sorted(candidates, key=lambda candidate: candidate[0], reverse=True)[0]
        item["program_id"] = program["id"]
        item["mission_area_id"] = program["mission_area_id"]
        confidence = round(min(0.99, 0.55 + score / 25), 2)
        links.append(
            {
                "id": slug(f"{program['id']}-{item['id']}-{relationship_type}"),
                "program_id": program["id"],
                "budget_line_item_id": item["id"],
                "relationship_type": relationship_type,
                "confidence_score": confidence,
                "explanation": f"Matched {program['short_name']} to line item using: {', '.join(hits)}",
            },
        )
    return links


def weapons_budget_document(payload: dict[str, Any]) -> dict[str, Any]:
    metadata = payload["metadata"]
    return {
        "id": metadata["id"],
        "title": metadata["title"],
        "fiscal_year": metadata["fiscal_year"],
        "document_type": metadata["document_type"],
        "service_or_component": None,
        "appropriation_type": "RDT&E / Procurement",
        "source_filename": metadata["source_filename"],
        "source_url": None,
        "page_count": metadata.get("page_count"),
        "row_count": len(payload.get("funding_rows", [])),
        "included_in_toa_total_millions": payload.get("metadata", {}).get("total_fy2027_millions"),
        "displayed_total_millions": payload.get("metadata", {}).get("total_fy2027_millions"),
        "parser_confidence": 0.88,
    }


def main() -> None:
    payload = json.loads(SEED_PATH.read_text())
    parsed_documents: list[dict[str, Any]] = []
    line_items: list[dict[str, Any]] = []
    missing: list[str] = []

    for parser, path in WORKBOOKS:
        if not path.exists():
            missing.append(str(path.relative_to(ROOT)))
            continue
        parsed = parser.parse(str(path))
        parsed_documents.append(parsed.metadata)
        line_items.extend(parsed.line_items)

    if not parsed_documents:
        raise SystemExit("No R-1, P-1, or O-1 workbook files were found in data/.")

    links = build_program_line_links(payload["programs"], line_items)
    payload["budget_documents"] = [weapons_budget_document(payload), *parsed_documents]
    payload["budget_line_items"] = line_items
    payload["program_line_item_links"] = links

    SEED_PATH.write_text(json.dumps(payload, indent=2) + "\n")

    included_rows = sum(1 for item in line_items if item.get("include_in_toa"))
    review_rows = sum(1 for item in line_items if item.get("needs_review"))
    linked_items = {link["budget_line_item_id"] for link in links}
    print("Budget display ingest summary")
    print(f"  documents parsed: {len(parsed_documents)}")
    print(f"  missing files: {', '.join(missing) if missing else 'none'}")
    print(f"  line items found: {len(line_items)}")
    print(f"  included in TOA rows: {included_rows}")
    print(f"  program links created: {len(links)}")
    print(f"  unlinked line items: {len(line_items) - len(linked_items)}")
    print(f"  rows needing review: {review_rows}")


if __name__ == "__main__":
    main()
