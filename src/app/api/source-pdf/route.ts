import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";

export async function GET() {
  const pdf = await readFile(join(process.cwd(), "data/FY2027_Weapons.pdf"));
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="FY2027_Weapons.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
