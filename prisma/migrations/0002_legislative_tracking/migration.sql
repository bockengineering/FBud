CREATE TABLE legislative_documents (
  id TEXT PRIMARY KEY,
  fiscal_year INTEGER NOT NULL,
  chamber TEXT NOT NULL,
  document_type TEXT NOT NULL,
  bill_number TEXT,
  title TEXT NOT NULL,
  source_url TEXT,
  source_filename TEXT,
  publication_date TIMESTAMP,
  uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE appropriation_marks (
  id TEXT PRIMARY KEY,
  legislative_document_id TEXT NOT NULL REFERENCES legislative_documents(id),
  program_id TEXT REFERENCES programs(id),
  budget_line_item_id TEXT REFERENCES budget_line_items(id),
  fiscal_year INTEGER NOT NULL,
  chamber TEXT NOT NULL,
  stage TEXT NOT NULL,
  funding_type TEXT,
  amount_millions NUMERIC,
  quantity NUMERIC,
  delta_from_request_millions NUMERIC,
  percent_delta_from_request NUMERIC,
  mark_disposition TEXT,
  explanatory_text TEXT,
  source_page TEXT,
  raw_text TEXT,
  confidence_score NUMERIC,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
