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
  budget_line_items: Array<Record<string, unknown>>;
};
