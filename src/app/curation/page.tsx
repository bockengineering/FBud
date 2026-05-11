import { AppShell } from "@/components/AppShell";
import {
  CurationWorkspace,
  type CurationDocument,
  type CurationLineItem,
  type CurationLink,
  type CurationProgram,
} from "@/components/CurationWorkspace";
import { getBudgetDocuments, getBudgetLineItems, getProgramLineItemLinks, getDataset } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CurationPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const data = getDataset();
  const programs: CurationProgram[] = data.programs.map(({ id, name, short_name }) => ({ id, name, short_name }));
  const lineItems: CurationLineItem[] = getBudgetLineItems().map(
    ({
      id,
      program_id,
      document_id,
      document_type,
      line_item_name,
      service_or_component,
      account_title,
      appropriation_account,
      program_element,
      line_number,
      organization,
      raw_text,
      needs_review,
      amount_millions,
      source_page,
      appropriation_type,
      include_in_toa,
    }) => ({
      id,
      program_id,
      document_id,
      document_type,
      line_item_name,
      service_or_component,
      account_title,
      appropriation_account,
      program_element,
      line_number,
      organization,
      raw_text,
      needs_review,
      amount_millions,
      source_page,
      appropriation_type,
      include_in_toa,
    }),
  );
  const links: CurationLink[] = getProgramLineItemLinks().map(({ budget_line_item_id, program_id, relationship_type }) => ({
    budget_line_item_id,
    program_id,
    relationship_type,
  }));
  const documents: CurationDocument[] = getBudgetDocuments().map(({ id, source_filename }) => ({ id, source_filename }));

  return (
    <AppShell>
      <CurationWorkspace
        programs={programs}
        lineItems={lineItems}
        links={links}
        documents={documents}
        initialLineItemId={one(params.line)}
      />
    </AppShell>
  );
}
