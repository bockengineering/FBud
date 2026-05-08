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

  await prisma.budgetDocument.create({
    data: {
      id: payload.metadata.id,
      title: payload.metadata.title,
      fiscalYear: payload.metadata.fiscal_year,
      documentType: payload.metadata.document_type,
      sourceFilename: payload.metadata.source_filename,
      appropriationType: "RDT&E / Procurement",
    },
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

  console.log(`Loaded ${payload.programs.length} programs and ${payload.funding_rows.length} funding rows into Prisma.`);
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
