CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  source_filename TEXT NOT NULL,
  source_type TEXT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE mission_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fy2027_total_amount_millions NUMERIC,
  historical_funding_json JSONB,
  source_page TEXT
);

CREATE TABLE programs (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id),
  mission_area_id TEXT NOT NULL REFERENCES mission_areas(id),
  name TEXT NOT NULL,
  short_name TEXT,
  service_or_component TEXT,
  page_label TEXT,
  pdf_page_number INTEGER,
  description TEXT,
  mission TEXT,
  fy2027_program_summary TEXT,
  prime_contractors_json JSONB,
  notes TEXT,
  source_text TEXT,
  confidence_score NUMERIC,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE program_funding (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id),
  fiscal_year INTEGER NOT NULL,
  funding_stage TEXT NOT NULL,
  funding_type TEXT NOT NULL,
  discretionary_amount_millions NUMERIC,
  mandatory_amount_millions NUMERIC,
  total_amount_millions NUMERIC,
  quantity NUMERIC,
  service_or_component TEXT,
  line_item_name TEXT,
  source_page TEXT,
  raw_table_text TEXT,
  confidence_score NUMERIC,
  needs_review BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE contractors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  normalized_name TEXT NOT NULL
);

CREATE TABLE program_contractors (
  program_id TEXT NOT NULL REFERENCES programs(id),
  contractor_id TEXT NOT NULL REFERENCES contractors(id),
  role TEXT NOT NULL,
  PRIMARY KEY (program_id, contractor_id, role)
);

CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY,
  program_id TEXT REFERENCES programs(id),
  mission_area_id TEXT,
  page_number INTEGER,
  chunk_type TEXT NOT NULL,
  text TEXT NOT NULL
);

CREATE TABLE program_relationships (
  id TEXT PRIMARY KEY,
  source_program_id TEXT NOT NULL REFERENCES programs(id),
  target_program_id TEXT NOT NULL REFERENCES programs(id),
  relationship_type TEXT NOT NULL,
  score NUMERIC NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE budget_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  service_or_component TEXT,
  appropriation_type TEXT,
  source_filename TEXT,
  source_url TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE budget_line_items (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES budget_documents(id),
  program_id TEXT,
  mission_area_id TEXT,
  service_or_component TEXT,
  appropriation_type TEXT,
  appropriation_account TEXT,
  budget_activity TEXT,
  budget_activity_name TEXT,
  program_element TEXT,
  line_number TEXT,
  line_item_name TEXT,
  project_number TEXT,
  project_name TEXT,
  fiscal_year INTEGER,
  prior_year_actual NUMERIC,
  current_year_enacted NUMERIC,
  budget_year_request NUMERIC,
  amount_millions NUMERIC,
  quantity NUMERIC,
  source_page TEXT,
  raw_text TEXT,
  confidence_score NUMERIC,
  needs_review BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE program_line_item_links (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES programs(id),
  budget_line_item_id TEXT NOT NULL REFERENCES budget_line_items(id),
  relationship_type TEXT NOT NULL,
  confidence_score NUMERIC,
  explanation TEXT
);
