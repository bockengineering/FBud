import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgetLineItemsForProgram, delta, getBudgetDocument, lineItemDelta, lineItemRequestTotal, money } from "@/lib/data";

export function BudgetLineItemsPanel({ programId }: { programId: string }) {
  const items = budgetLineItemsForProgram(programId);
  const includedItems = items.filter((item) => item.include_in_toa);
  const totals = includedItems.reduce<Record<string, number>>((accumulator, item) => {
    const key = item.appropriation_type ?? "Other";
    accumulator[key] = (accumulator[key] ?? 0) + lineItemRequestTotal(item);
    return accumulator;
  }, {});

  return (
    <Card className="border-white/10 bg-white/[0.045] shadow-none">
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <CardTitle className="text-white">Budget Line Items</CardTitle>
            <p className="mt-1 text-sm text-slate-400">Linked R-1, P-1, and O-1 rows beneath this Weapons Book program.</p>
          </div>
          <Link href="/budget-lines?linked=linked" className="text-sm text-cyan-300 hover:text-cyan-100">
            Open line explorer
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          <>
            <div className="flex flex-wrap gap-2">
              {Object.entries(totals).map(([label, value]) => (
                <Badge key={label} className="bg-cyan-400/10 text-cyan-200">
                  {label}: {money(value)}
                </Badge>
              ))}
              <Badge variant="outline" className="border-white/10 text-slate-300">
                {items.length} linked rows
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Line item</TableHead>
                  <TableHead>Doc</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">FY2027</TableHead>
                  <TableHead className="text-right">26 to 27</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.slice(0, 10).map((item) => {
                  const document = getBudgetDocument(item.document_id);
                  return (
                    <TableRow key={item.id} className="border-white/10">
                      <TableCell>
                        <Link href={`/budget-lines/${item.id}`} className="font-medium text-cyan-200 hover:text-cyan-100">
                          {item.line_item_name}
                        </Link>
                        <div className="mt-1 text-xs text-slate-500">
                          Line {item.line_number || "n/a"} {item.program_element ? `| ${item.program_element}` : ""}
                        </div>
                      </TableCell>
                      <TableCell className="uppercase text-slate-300">{item.document_type}</TableCell>
                      <TableCell className="text-slate-400">{item.appropriation_account}</TableCell>
                      <TableCell className="text-right text-white">{money(lineItemRequestTotal(item))}</TableCell>
                      <TableCell className="text-right">{delta(lineItemDelta(item))}</TableCell>
                      <TableCell className="text-xs text-slate-500">{document?.source_filename ?? item.source_page}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {items.length > 10 ? <p className="text-sm text-slate-500">Showing the 10 largest linked rows. Open the explorer for the full set.</p> : null}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-white/10 p-5 text-sm text-slate-400">
            No R-1, P-1, or O-1 rows are confidently linked yet. The explorer still shows unlinked rows that can be manually tied to this program later.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
