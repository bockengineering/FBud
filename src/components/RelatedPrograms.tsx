import { ProgramCard } from "@/components/ProgramCard";
import { getRelatedPrograms } from "@/lib/related-programs";

export function RelatedPrograms({ programId }: { programId: string }) {
  const groups = getRelatedPrograms(programId);
  if (!groups.length) return null;
  return (
    <section className="space-y-5">
      <h2 className="text-xl font-semibold text-white">Related Programs</h2>
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">{group.title}</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {group.programs.map((program) => (
              <ProgramCard key={`${group.title}-${program.id}`} program={program} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
