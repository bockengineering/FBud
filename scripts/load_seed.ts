import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type SeedProgram = {
  id: string;
  document_id: string;
  mission_area_id: string;
  name: string;
  short_name: string;
  service_or_component: string;
  page_label: string;
  pdf_page_number: number | null;
  description: string;
  mission: string;
  fy2027_program_summary: string;
  prime_contractors: Array<{ name: string; role: string }>;
  notes: string;
  source_text: string;
  confidence_score: number;
  needs_review: boolean;
  computed: {
    fy2027_total: number;
  };
};

type SeedPayload = {
  metadata: {
    id: string;
    title: string;
    fiscal_year: number;
    source_filename: string;
    source_type: string;
    document_type: string;
  };
  mission_areas: Array<{
    id: string;
    name: string;
    description: string;
    fy2027_total_amount_millions: number;
    historical_funding_json: Record<string, number>;
    source_page: string;
  }>;
  programs: SeedProgram[];
  funding_rows: Array<{
    id: string;
    program_id: string;
    fiscal_year: number;
    funding_stage: string;
    funding_type: string;
    discretionary_amount_millions: number | null;
    mandatory_amount_millions: number | null;
    total_amount_millions: number | null;
    quantity: number | null;
    service_or_component: string | null;
    line_item_name: string | null;
    source_page: string | null;
    raw_table_text: string | null;
    confidence_score: number | null;
    needs_review: boolean;
  }>;
  contractors: Array<{ id: string; name: string; normalized_name: string; location: string }>;
  document_chunks: Array<{
    id: string;
    program_id: string | null;
    mission_area_id: string | null;
    page_number: number | null;
    chunk_type: string;
    text: string;
  }>;
  program_relationships: Array<{
    id: string;
    source_program_id: string;
    target_program_id: string;
    relationship_type: string;
    score: number;
    explanation: string | null;
  }>;
  budget_documents?: Array<{
    id: string;
    title: string;
    fiscal_year: number;
    document_type: string;
    service_or_component: string | null;
    appropriation_type: string | null;
    source_filename: string | null;
    source_url: string | null;
  }>;
  budget_line_items?: Array<{
    id: string;
    document_id: string;
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
    line_item_name: string | null;
    project_number: string | null;
    project_name: string | null;
    cost_type: string | null;
    cost_type_title: string | null;
    add_non_add: string | null;
    include_in_toa: boolean | null;
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
  }>;
  program_line_item_links?: Array<{
    id: string;
    program_id: string;
    budget_line_item_id: string;
    relationship_type: string;
    confidence_score: number | null;
    explanation: string | null;
  }>;
};

const optional = process.argv.includes("--optional");

if (!process.env.DATABASE_URL) {
  if (optional) {
    console.log("DATABASE_URL not set; skipped Prisma seed load.");
    process.exit(0);
  }
  throw new Error("DATABASE_URL is required for db:seed.");
}

const prisma = new PrismaClient();
const payload = JSON.parse(readFileSync(join(process.cwd(), "src/data/weapons-data.json"), "utf8")) as SeedPayload;

async function main() {
  await prisma.programLineItemLink.deleteMany();
  await prisma.appropriationMark.deleteMany();
  await prisma.legislativeDocument.deleteMany();
  await prisma.budgetLineItem.deleteMany();
  await prisma.budgetDocument.deleteMany();
  await prisma.programRelationship.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.programContractor.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.programFunding.deleteMany();
  await prisma.program.deleteMany();
  await prisma.missionArea.deleteMany();
  await prisma.document.deleteMany();

  await prisma.document.create({
    data: {
      id: payload.metadata.id,
      title: payload.metadata.title,
      fiscalYear: payload.metadata.fiscal_year,
      sourceFilename: payload.metadata.source_filename,
      sourceType: payload.metadata.source_type,
    },
  });

  const budgetDocuments = payload.budget_documents?.length
    ? payload.budget_documents
    : [
        {
          id: payload.metadata.id,
          title: payload.metadata.title,
          fiscal_year: payload.metadata.fiscal_year,
          document_type: payload.metadata.document_type,
          service_or_component: null,
          appropriation_type: "RDT&E / Procurement",
          source_filename: payload.metadata.source_filename,
          source_url: null,
        },
      ];

  await prisma.budgetDocument.createMany({
    data: budgetDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      fiscalYear: document.fiscal_year,
      documentType: document.document_type,
      serviceOrComponent: document.service_or_component,
      appropriationType: document.appropriation_type,
      sourceFilename: document.source_filename,
      sourceUrl: document.source_url,
    })),
    skipDuplicates: true,
  });

  await prisma.legislativeDocument.create({
    data: {
      id: "fy2027-weapons-pb-request",
      fiscalYear: payload.metadata.fiscal_year,
      chamber: "executive",
      documentType: "presidents_budget_request",
      title: "FY2027 President's Budget Request Baseline from Weapons Book",
      sourceFilename: payload.metadata.source_filename,
    },
  });

  await prisma.missionArea.createMany({
    data: payload.mission_areas.map((mission) => ({
      id: mission.id,
      name: mission.name,
      description: mission.description,
      fy2027TotalAmountMillions: mission.fy2027_total_amount_millions,
      historicalFundingJson: mission.historical_funding_json,
      sourcePage: mission.source_page,
    })),
  });

  await prisma.contractor.createMany({
    data: payload.contractors.map((contractor) => ({
      id: contractor.id,
      name: contractor.name,
      normalizedName: contractor.normalized_name,
      location: contractor.location,
    })),
  });

  await prisma.program.createMany({
    data: payload.programs.map((program) => ({
      id: program.id,
      documentId: program.document_id,
      missionAreaId: program.mission_area_id,
      name: program.name,
      shortName: program.short_name,
      serviceOrComponent: program.service_or_component,
      pageLabel: program.page_label,
      pdfPageNumber: program.pdf_page_number,
      description: program.description,
      mission: program.mission,
      fy2027ProgramSummary: program.fy2027_program_summary,
      primeContractorsJson: program.prime_contractors,
      notes: program.notes,
      sourceText: program.source_text,
      confidenceScore: program.confidence_score,
      needsReview: program.needs_review,
    })),
  });

  const contractorIdByName = new Map(payload.contractors.map((contractor) => [contractor.name.toLowerCase(), contractor.id]));
  await prisma.programContractor.createMany({
    data: payload.programs.flatMap((program) =>
      program.prime_contractors.flatMap((contractor) => {
        const contractorId = contractorIdByName.get(contractor.name.toLowerCase());
        return contractorId ? [{ programId: program.id, contractorId, role: contractor.role || "prime" }] : [];
      }),
    ),
    skipDuplicates: true,
  });

  await prisma.programFunding.createMany({
    data: payload.funding_rows.map((row) => ({
      id: row.id,
      programId: row.program_id,
      fiscalYear: row.fiscal_year,
      fundingStage: row.funding_stage,
      fundingType: row.funding_type,
      discretionaryAmountMillions: row.discretionary_amount_millions,
      mandatoryAmountMillions: row.mandatory_amount_millions,
      totalAmountMillions: row.total_amount_millions,
      quantity: row.quantity,
      serviceOrComponent: row.service_or_component,
      lineItemName: row.line_item_name,
      sourcePage: row.source_page,
      rawTableText: row.raw_table_text,
      confidenceScore: row.confidence_score,
      needsReview: row.needs_review,
    })),
  });

  await prisma.documentChunk.createMany({
    data: payload.document_chunks.map((chunk) => ({
      id: String(chunk.id),
      programId: chunk.program_id ? String(chunk.program_id) : null,
      missionAreaId: chunk.mission_area_id ? String(chunk.mission_area_id) : null,
      pageNumber: chunk.page_number ? Number(chunk.page_number) : null,
      chunkType: String(chunk.chunk_type),
      text: String(chunk.text),
    })),
  });

  await prisma.programRelationship.createMany({
    data: payload.program_relationships.map((relationship) => ({
      id: relationship.id,
      sourceProgramId: relationship.source_program_id,
      targetProgramId: relationship.target_program_id,
      relationshipType: relationship.relationship_type,
      score: relationship.score,
      explanation: relationship.explanation,
    })),
  });

  const budgetLineItems = payload.budget_line_items ?? [];
  if (budgetLineItems.length) {
    await prisma.budgetLineItem.createMany({
      data: budgetLineItems.map((item) => ({
        id: item.id,
        documentId: item.document_id,
        programId: item.program_id,
        missionAreaId: item.mission_area_id,
        serviceOrComponent: item.service_or_component,
        appropriationType: item.appropriation_type,
        appropriationAccount: item.appropriation_account,
        accountTitle: item.account_title,
        organization: item.organization,
        budgetActivity: item.budget_activity,
        budgetActivityName: item.budget_activity_name,
        budgetSubactivity: item.budget_subactivity,
        budgetSubactivityName: item.budget_subactivity_name,
        programElement: item.program_element,
        lineNumber: item.line_number,
        lineItemName: item.line_item_name,
        projectNumber: item.project_number,
        projectName: item.project_name,
        costType: item.cost_type,
        costTypeTitle: item.cost_type_title,
        addNonAdd: item.add_non_add,
        includeInToa: item.include_in_toa,
        includeInToaLabel: item.include_in_toa_label,
        classification: item.classification,
        fiscalYear: item.fiscal_year,
        priorYearActual: item.prior_year_actual,
        currentYearEnacted: item.current_year_enacted,
        budgetYearRequest: item.budget_year_request,
        amountMillions: item.amount_millions,
        quantity: item.quantity,
        fy2025ActualAmount: item.fy2025_actual_amount_millions,
        fy2025ReconciliationAmount: item.fy2025_reconciliation_amount_millions,
        fy2025TotalAmount: item.fy2025_total_amount_millions,
        fy2026DiscretionaryEnactedAmount: item.fy2026_discretionary_enacted_amount_millions,
        fy2026MandatoryAmount: item.fy2026_mandatory_amount_millions,
        fy2026TotalAmount: item.fy2026_total_amount_millions,
        fy2027DiscretionaryRequestAmount: item.fy2027_discretionary_request_amount_millions,
        fy2027MandatoryRequestAmount: item.fy2027_mandatory_request_amount_millions,
        fy2027TotalAmount: item.fy2027_total_amount_millions,
        fy2025ActualQuantity: item.fy2025_actual_quantity,
        fy2025ReconciliationQuantity: item.fy2025_reconciliation_quantity,
        fy2025TotalQuantity: item.fy2025_total_quantity,
        fy2026DiscretionaryEnactedQuantity: item.fy2026_discretionary_enacted_quantity,
        fy2026MandatoryQuantity: item.fy2026_mandatory_quantity,
        fy2026TotalQuantity: item.fy2026_total_quantity,
        fy2027DiscretionaryRequestQuantity: item.fy2027_discretionary_request_quantity,
        fy2027MandatoryRequestQuantity: item.fy2027_mandatory_request_quantity,
        fy2027TotalQuantity: item.fy2027_total_quantity,
        sourcePage: item.source_page,
        rawText: item.raw_text,
        confidenceScore: item.confidence_score,
        needsReview: item.needs_review,
      })),
      skipDuplicates: true,
    });
  }

  const programLineItemLinks = payload.program_line_item_links ?? [];
  if (programLineItemLinks.length) {
    await prisma.programLineItemLink.createMany({
      data: programLineItemLinks.map((link) => ({
        id: link.id,
        programId: link.program_id,
        budgetLineItemId: link.budget_line_item_id,
        relationshipType: link.relationship_type,
        confidenceScore: link.confidence_score,
        explanation: link.explanation,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.appropriationMark.createMany({
    data: payload.programs.map((program) => ({
      id: `${program.id}-fy2027-pb-request-total`,
      legislativeDocumentId: "fy2027-weapons-pb-request",
      programId: program.id,
      fiscalYear: payload.metadata.fiscal_year,
      chamber: "executive",
      stage: "request",
      fundingType: "Total",
      amountMillions: program.computed.fy2027_total,
      deltaFromRequestMillions: 0,
      percentDeltaFromRequest: 0,
      markDisposition: "baseline_request",
      sourcePage: program.page_label,
      rawText: program.source_text,
      confidenceScore: program.confidence_score,
      needsReview: program.needs_review,
    })),
  });

  console.log(
    `Loaded ${payload.programs.length} programs, ${payload.funding_rows.length} funding rows, and ${budgetLineItems.length} budget line items into Prisma.`,
  );
}

main()
  .catch((error) => {
    if (optional) {
      console.log(`Prisma seed skipped: ${error.message}`);
      return;
    }
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
