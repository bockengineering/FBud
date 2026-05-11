import { AppShell } from "@/components/AppShell";
import { CurationWorkspace } from "@/components/CurationWorkspace";
import { getBudgetDocuments, getBudgetLineItems, getProgramLineItemLinks, getDataset } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CurationPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const data = getDataset();

  return (
    <AppShell>
      <CurationWorkspace
        programs={data.programs}
        lineItems={getBudgetLineItems()}
        links={getProgramLineItemLinks()}
        documents={getBudgetDocuments()}
        initialLineItemId={one(params.line)}
      />
    </AppShell>
  );
}
