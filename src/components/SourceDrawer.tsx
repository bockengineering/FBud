"use client";

import { ExternalLink, FileText, Highlighter } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SourceDrawer({
  programName,
  sectionLabel,
  pageLabel,
  pdfPageNumber,
  excerpt,
  triggerLabel = "Source",
  variant = "outline",
  className,
}: {
  programName: string;
  sectionLabel: string;
  pageLabel: string;
  pdfPageNumber: number | null;
  excerpt: string;
  triggerLabel?: string;
  variant?: "outline" | "ghost" | "link";
  className?: string;
}) {
  const page = pdfPageNumber ?? 1;
  const pdfUrl = `/api/source-pdf#page=${page}&zoom=page-width&navpanes=0&toolbar=0`;
  const pageImageUrl = `/source-pages/page-${page}.jpg`;
  const cleanExcerpt = excerpt?.trim() || "No parsed excerpt is available for this section.";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            "gap-2 border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
            variant === "ghost" && "border-transparent bg-transparent text-cyan-200 hover:bg-cyan-300/10",
            variant === "link" && "h-auto border-0 bg-transparent p-0 text-cyan-300 underline-offset-4 hover:bg-transparent hover:underline",
            className,
          )}
        >
          <FileText className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="!w-[98vw] !max-w-[98vw] border-white/10 bg-[#071018] p-0 text-slate-100 sm:!max-w-[98vw] lg:!w-[min(1400px,96vw)] lg:!max-w-[min(1400px,96vw)]"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <div className="flex flex-col gap-3 pr-10 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <SheetTitle className="text-lg text-white">{sectionLabel}</SheetTitle>
              <SheetDescription className="mt-1 text-slate-400">
                {programName} · Weapons Book p. {pageLabel} · PDF page {page}
              </SheetDescription>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
            >
              Open PDF page
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </SheetHeader>
        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden xl:grid-cols-[minmax(720px,1fr)_420px]">
          <div className="min-h-[68vh] overflow-auto border-b border-white/10 bg-[#111827] p-4 xl:min-h-0 xl:border-b-0 xl:border-r xl:p-6">
            <div className="mx-auto max-w-[980px] rounded-sm bg-white p-2 shadow-2xl">
              <Image
                src={pageImageUrl}
                alt={`${programName} source page ${pageLabel}`}
                width={1224}
                height={1584}
                className="h-auto w-full"
                unoptimized
              />
            </div>
          </div>
          <aside className="min-h-0 overflow-auto bg-[#0a1621] p-4 xl:p-5">
            <div className="rounded-md border border-cyan-300/30 bg-cyan-300/8 p-4 shadow-[0_0_0_1px_rgba(34,211,238,.08)_inset]">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-200">
                <Highlighter className="h-4 w-4" />
                Highlighted parser evidence
              </div>
              <div className="max-h-[34vh] overflow-auto whitespace-pre-wrap rounded border border-white/10 bg-black/25 p-3 text-sm leading-6 text-slate-100 xl:max-h-[68vh]">
                {cleanExcerpt}
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              This viewer renders the cited PDF page as an image so it stays readable inside FBud.
              Use the PDF link for the native browser viewer; coordinate-level overlays can be added by storing PyMuPDF bounding boxes during ingestion.
            </p>
          </aside>
        </div>
      </SheetContent>
    </Sheet>
  );
}
