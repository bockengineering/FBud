import { getDataset } from "@/lib/data";
import type { Program } from "@/lib/types";

export type RelatedGroup = {
  title: string;
  programs: Array<Program & { reason: string; score: number }>;
};

const labels: Record<string, string> = {
  same_mission_area: "Same Mission Area",
  same_contractor: "Same Contractor",
  same_service: "Same Service",
  similar_funding_pattern: "Similar Funding Pattern",
  similar_keyword: "Similar Keywords",
  similar_funding_size: "Similar Funding Pattern",
  similar_rdte_mix: "Similar Funding Pattern",
};

export function getRelatedPrograms(programId: string): RelatedGroup[] {
  const data = getDataset();
  const targets = new Map(data.programs.map((program) => [program.id, program]));
  const grouped = new Map<string, Array<Program & { reason: string; score: number }>>();
  data.program_relationships
    .filter((relationship) => relationship.source_program_id === programId)
    .sort((a, b) => b.score - a.score)
    .forEach((relationship) => {
      const program = targets.get(relationship.target_program_id);
      if (!program) return;
      const title = labels[relationship.relationship_type] ?? "Related Programs";
      if (!grouped.has(title)) grouped.set(title, []);
      const bucket = grouped.get(title);
      if (bucket && bucket.length < 4) {
        bucket.push({ ...program, reason: relationship.explanation, score: relationship.score });
      }
    });

  return Array.from(grouped.entries()).map(([title, programs]) => ({ title, programs }));
}
