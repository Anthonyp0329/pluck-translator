import { NextRequest, NextResponse } from "next/server";
import { incrementQuizCorrect } from "@/lib/queries";

export async function POST(req: NextRequest) {
  const { id, correct } = await req.json();
  if (typeof id !== "number" || typeof correct !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const graduated = correct ? incrementQuizCorrect(id) : false;
  return NextResponse.json({ ok: true, graduated });
}
