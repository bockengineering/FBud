import dataset from "@/data/weapons-data.json";
import type {
  AppropriationStage,
  BudgetDataset,
  BudgetDocument,
  BudgetLineItem,
  Contractor,
  MissionArea,
  Program,
  ProgramLineItemLink,
} from "@/lib/types";

const data = dataset as BudgetDataset;

export function getDataset() {
  return data;
}

export function money(value = 0) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${value.toFixed(1)}M`;
}

export function delta(value = 0) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${money(value)}`;
}

export function pct(value = 0) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function source(page?: string) {
  return page ? `Source p. ${page}` : "Source page pending";
}

export function getProgram(id: string) {
  return data.programs.find((program) => program.id === id);
}

export function getMissionArea(id: string) {
  return data.mission_areas.find((mission) => mission.id === id);
}

export function getContractor(id: string) {
  return data.contractors.find((contractor) => contractor.id === id);
}

export function getBudgetDocuments(): BudgetDocument[] {
  return data.budget_documents ?? [
    {
      id: data.metadata.id,
      title: data.metadata.title,
      fiscal_year: data.metadata.fiscal_year,
      document_type: data.metadata.document_type,
      service_or_component: null,
      appropriation_type: "RDT&E / Procurement",
      source_filename: data.metadata.source_filename,
      source_url: null,
      row_count: data.funding_rows.length,
      displayed_total_millions: summary().totalFy2027,
      included_in_toa_total_millions: summary().totalFy2027,
      parser_confidence: 0.88,
    },
  ];
}

export function getBudgetDocument(id: string) {
  return getBudgetDocuments().find((document) => document.id === id);
}

export function getBudgetLineItems(): BudgetLineItem[] {
  return data.budget_line_items ?? [];
}

export function getBudgetLineItem(id: string) {
  return getBudgetLineItems().find((item) => item.id === id);
}

export function getProgramLineItemLinks(): ProgramLineItemLink[] {
  return data.program_line_item_links ?? [];
}

export function budgetLineItemsForProgram(programId: string) {
  const links = new Set(getProgramLineItemLinks().filter((link) => link.program_id === programId).map((link) => link.budget_line_item_id));
  return getBudgetLineItems()
    .filter((item) => item.program_id === programId || links.has(item.id))
    .sort((a, b) => (b.amount_millions ?? 0) - (a.amount_millions ?? 0));
}

export function linkForBudgetLineItem(itemId: string) {
  return getProgramLineItemLinks().find((link) => link.budget_line_item_id === itemId);
}

export function programForBudgetLineItem(item: BudgetLineItem) {
  const linkedProgramId = item.program_id ?? linkForBudgetLineItem(item.id)?.program_id;
  return linkedProgramId ? getProgram(linkedProgramId) : undefined;
}

export function lineItemDelta(item: BudgetLineItem) {
  return (item.fy2027_total_amount_millions ?? item.amount_millions ?? 0) - (item.fy2026_total_amount_millions ?? 0);
}

export function lineItemRequestTotal(item: BudgetLineItem) {
  return item.fy2027_total_amount_millions ?? item.amount_millions ?? 0;
}

export function budgetLineSearch(item: BudgetLineItem, query: string) {
  const program = programForBudgetLineItem(item);
  const document = getBudgetDocument(item.document_id);
  const haystack = [
    item.line_item_name,
    item.program_element,
    item.appropriation_account,
    item.account_title,
    item.budget_activity_name,
    item.budget_subactivity_name,
    item.service_or_component,
    item.appropriation_type,
    item.raw_text,
    program?.name,
    program?.short_name,
    document?.title,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function filteredBudgetLineItems(params: {
  q?: string;
  document?: string;
  appropriation?: string;
  service?: string;
  linked?: string;
  toa?: string;
  sort?: string;
}) {
  let items = [...getBudgetLineItems()];
  if (params.q) items = items.filter((item) => budgetLineSearch(item, params.q ?? ""));
  if (params.document) items = items.filter((item) => item.document_id === params.document || item.document_type === params.document);
  if (params.appropriation) items = items.filter((item) => item.appropriation_type === params.appropriation);
  if (params.service) items = items.filter((item) => item.service_or_component === params.service);
  if (params.linked === "linked") items = items.filter((item) => Boolean(item.program_id ?? linkForBudgetLineItem(item.id)?.program_id));
  if (params.linked === "unlinked") items = items.filter((item) => !Boolean(item.program_id ?? linkForBudgetLineItem(item.id)?.program_id));
  if (params.toa === "included") items = items.filter((item) => item.include_in_toa);
  if (params.toa === "memo") items = items.filter((item) => !item.include_in_toa);

  const sort = params.sort ?? "fy2027";
  items.sort((a, b) => {
    if (sort === "growth") return lineItemDelta(b) - lineItemDelta(a);
    if (sort === "decline") return lineItemDelta(a) - lineItemDelta(b);
    if (sort === "name") return a.line_item_name.localeCompare(b.line_item_name);
    if (sort === "document") return a.document_type.localeCompare(b.document_type);
    return lineItemRequestTotal(b) - lineItemRequestTotal(a);
  });
  return items;
}

export function budgetLineSummary() {
  const items = getBudgetLineItems();
  const included = items.filter((item) => item.include_in_toa);
  return {
    documentCount: getBudgetDocuments().filter((document) => document.document_type !== "weapons_book").length,
    lineItemCount: items.length,
    includedLineItemCount: included.length,
    linkedLineItemCount: items.filter((item) => Boolean(item.program_id ?? linkForBudgetLineItem(item.id)?.program_id)).length,
    reviewLineItemCount: items.filter((item) => item.needs_review).length,
    fy2027IncludedTotal: included.reduce((sum, item) => sum + lineItemRequestTotal(item), 0),
    rdteTotal: included.filter((item) => item.appropriation_type === "RDT&E").reduce((sum, item) => sum + lineItemRequestTotal(item), 0),
    procurementTotal: included.filter((item) => item.appropriation_type === "Procurement").reduce((sum, item) => sum + lineItemRequestTotal(item), 0),
    omTotal: included.filter((item) => item.appropriation_type === "O&M").reduce((sum, item) => sum + lineItemRequestTotal(item), 0),
  };
}

export function contractorPrograms(contractor: Contractor) {
  const key = contractor.name.toLowerCase();
  return data.programs.filter((program) =>
    program.prime_contractors.some((item) => item.name.toLowerCase() === key),
  );
}

export function missionPrograms(mission: MissionArea) {
  return data.programs.filter((program) => program.mission_area_id === mission.id);
}

export function programSearch(program: Program, query: string) {
  const haystack = [
    program.name,
    program.short_name,
    program.mission_area,
    program.service_or_component,
    program.description,
    program.mission,
    program.fy2027_program_summary,
    program.source_text,
    ...program.prime_contractors.map((contractor) => contractor.name),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function filteredPrograms(params: {
  q?: string;
  mission?: string;
  service?: string;
  contractor?: string;
  review?: string;
  cohort?: string;
  funding?: string;
  sort?: string;
}) {
  let programs = [...data.programs];
  if (params.q) programs = programs.filter((program) => programSearch(program, params.q ?? ""));
  if (params.mission) programs = programs.filter((program) => program.mission_area_id === params.mission);
  if (params.service) programs = programs.filter((program) => program.service_or_component === params.service);
  if (params.contractor) {
    programs = programs.filter((program) =>
      program.prime_contractors.some((contractor) => contractor.name === params.contractor),
    );
  }
  if (params.review === "true") programs = programs.filter((program) => program.needs_review);
  if (params.cohort === "growth") programs = programs.filter((program) => program.computed.absolute_change_26_to_27 > 0);
  if (params.cohort === "decline") programs = programs.filter((program) => program.computed.absolute_change_26_to_27 < 0);
  if (params.funding === "rdte") programs = programs.filter((program) => program.computed.fy2027_rdte > 0);
  if (params.funding === "procurement") programs = programs.filter((program) => program.computed.fy2027_procurement > 0);

  const sort = params.sort ?? "fy2027";
  programs.sort((a, b) => {
    if (sort === "growth") return b.computed.absolute_change_26_to_27 - a.computed.absolute_change_26_to_27;
    if (sort === "decline") return a.computed.absolute_change_26_to_27 - b.computed.absolute_change_26_to_27;
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "mission") return a.mission_area.localeCompare(b.mission_area);
    return b.computed.fy2027_total - a.computed.fy2027_total;
  });
  return programs;
}

export function summary() {
  const programs = data.programs;
  return {
    totalFy2027: programs.reduce((sum, program) => sum + program.computed.fy2027_total, 0),
    programCount: programs.length,
    missionCount: data.mission_areas.length,
    rdteFy2027: programs.reduce((sum, program) => sum + program.computed.fy2027_rdte, 0),
    procurementFy2027: programs.reduce((sum, program) => sum + program.computed.fy2027_procurement, 0),
    mandatoryFy2027: programs.reduce(
      (sum, program) => sum + (program.computed.fy2027_total * program.computed.mandatory_share_fy2027) / 100,
      0,
    ),
    reviewRows: data.funding_rows.filter((row) => row.needs_review).length,
  };
}

export function programAppropriationStages(program: Program): AppropriationStage[] {
  const request = program.computed.fy2027_total;
  return [
    {
      id: "request",
      label: "President's Budget Request",
      chamber: "Executive",
      status: "loaded",
      amount_millions: request,
      delta_from_request_millions: 0,
      percent_delta_from_request: 0,
      source_label: `Weapons Book p. ${program.page_label}`,
      source_url: null,
    },
    {
      id: "house",
      label: "House Mark",
      chamber: "House",
      status: "pending",
      amount_millions: null,
      delta_from_request_millions: null,
      percent_delta_from_request: null,
      source_label: null,
      source_url: null,
    },
    {
      id: "senate",
      label: "Senate Mark",
      chamber: "Senate",
      status: "pending",
      amount_millions: null,
      delta_from_request_millions: null,
      percent_delta_from_request: null,
      source_label: null,
      source_url: null,
    },
    {
      id: "conference",
      label: "Conference / JES",
      chamber: "Conference",
      status: "pending",
      amount_millions: null,
      delta_from_request_millions: null,
      percent_delta_from_request: null,
      source_label: null,
      source_url: null,
    },
    {
      id: "enacted",
      label: "Final Enacted",
      chamber: "Public Law",
      status: "pending",
      amount_millions: null,
      delta_from_request_millions: null,
      percent_delta_from_request: null,
      source_label: null,
      source_url: null,
    },
  ];
}

export function appropriationsSummary() {
  const totals = summary();
  return {
    requestTotal: totals.totalFy2027,
    trackedPrograms: data.programs.length,
    loadedMarks: data.programs.length,
    pendingStages: data.programs.length * 4,
  };
}
