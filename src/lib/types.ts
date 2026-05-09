export type ContractorRef = {
  name: string;
  role: string;
};

export type ProgramComputed = {
  fy2025_total: number;
  fy2026_total: number;
  fy2027_total: number;
  fy2025_rdte: number;
  fy2026_rdte: number;
  fy2027_rdte: number;
  fy2025_procurement: number;
  fy2026_procurement: number;
  fy2027_procurement: number;
  absolute_change_26_to_27: number;
  percent_change_26_to_27: number;
  absolute_change_25_to_27: number;
  percent_change_25_to_27: number;
  rdte_share_fy2027: number;
  procurement_share_fy2027: number;
  mandatory_share_fy2027: number;
  rank_by_fy2027_total: number;
  rank_by_growth_26_to_27: number;
};

export type Program = {
  id: string;
  document_id: string;
  mission_area: string;
  mission_area_id: string;
  name: string;
  short_name: string;
  service_or_component: string;
  page_label: string;
  pdf_page_number: number | null;
  description: string;
  mission: string;
  fy2027_program_summary: string;
  prime_contractors: ContractorRef[];
  notes: string;
  source_text: string;
  raw_table_text: string;
  confidence_score: number;
  needs_review: boolean;
  keywords: string[];
  computed: ProgramComputed;
};

export type MissionArea = {
  id: string;
  name: string;
  description: string;
  fy2027_total_amount_millions: number;
  historical_funding_json: Record<string, number>;
  source_page: string;
};

export type FundingRow = {
  id: string;
  program_id: string;
  fiscal_year: number;
  funding_stage: string;
  funding_type: string;
  total_amount_millions: number;
  source_page: string;
  needs_review: boolean;
  confidence_score: number;
};

export type Contractor = {
  id: string;
  name: string;
  normalized_name: string;
  location: string;
};

export type ProgramRelationship = {
  id: string;
  source_program_id: string;
  target_program_id: string;
  relationship_type: string;
  score: number;
  explanation: string;
};

export type BudgetDocument = {
  id: string;
  title: string;
  fiscal_year: number;
  document_type: string;
  service_or_component: string | null;
  appropriation_type: string | null;
  source_filename: string | null;
  source_url: string | null;
  sheet_name?: string;
  row_count?: number;
  included_in_toa_total_millions?: number | null;
  displayed_total_millions?: number | null;
  parser_confidence?: number;
};

export type BudgetLineItem = {
  id: string;
  document_id: string;
  document_type: string;
  program_id: string | null;
  mission_area_id: string | null;
  service_or_component: string | null;
  appropriation_type: string | null;
  appropriation_account: string | null;
  account_title: string | null;
  organization: string | null;
  budget_activity: string | null;
  budget_activity_name: string | null;
  budget_subactivity: string | null;
  budget_subactivity_name: string | null;
  program_element: string | null;
  line_number: string | null;
  line_item_name: string;
  project_number: string | null;
  project_name: string | null;
  cost_type: string | null;
  cost_type_title: string | null;
  add_non_add: string | null;
  include_in_toa: boolean;
  include_in_toa_label: string | null;
  classification: string | null;
  fiscal_year: number | null;
  prior_year_actual: number | null;
  current_year_enacted: number | null;
  budget_year_request: number | null;
  amount_millions: number | null;
  quantity: number | null;
  fy2025_actual_amount_millions: number | null;
  fy2025_reconciliation_amount_millions: number | null;
  fy2025_total_amount_millions: number | null;
  fy2026_discretionary_enacted_amount_millions: number | null;
  fy2026_mandatory_amount_millions: number | null;
  fy2026_total_amount_millions: number | null;
  fy2027_discretionary_request_amount_millions: number | null;
  fy2027_mandatory_request_amount_millions: number | null;
  fy2027_total_amount_millions: number | null;
  fy2025_actual_quantity: number | null;
  fy2025_reconciliation_quantity: number | null;
  fy2025_total_quantity: number | null;
  fy2026_discretionary_enacted_quantity: number | null;
  fy2026_mandatory_quantity: number | null;
  fy2026_total_quantity: number | null;
  fy2027_discretionary_request_quantity: number | null;
  fy2027_mandatory_request_quantity: number | null;
  fy2027_total_quantity: number | null;
  source_page: string | null;
  raw_text: string | null;
  confidence_score: number | null;
  needs_review: boolean;
};

export type ProgramLineItemLink = {
  id: string;
  program_id: string;
  budget_line_item_id: string;
  relationship_type: string;
  confidence_score: number | null;
  explanation: string | null;
};

export type AppropriationStage = {
  id: "request" | "house" | "senate" | "conference" | "enacted";
  label: string;
  chamber: string;
  status: "loaded" | "pending";
  amount_millions: number | null;
  delta_from_request_millions: number | null;
  percent_delta_from_request: number | null;
  source_label: string | null;
  source_url: string | null;
};

export type BudgetDataset = {
  metadata: {
    id: string;
    title: string;
    fiscal_year: number;
    source_filename: string;
    source_type: string;
    document_type: string;
    page_count: number;
  };
  mission_areas: MissionArea[];
  programs: Program[];
  funding_rows: FundingRow[];
  contractors: Contractor[];
  document_chunks: Array<Record<string, unknown>>;
  program_relationships: ProgramRelationship[];
  budget_documents?: BudgetDocument[];
  budget_line_items: BudgetLineItem[];
  program_line_item_links?: ProgramLineItemLink[];
};
