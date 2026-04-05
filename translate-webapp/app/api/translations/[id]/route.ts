import { NextRequest, NextResponse } from "next/server";
import { deleteTranslation } from "@/lib/queries";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  deleteTranslation(numId);
  return NextResponse.json({ ok: true });
}
