import { NextRequest, NextResponse } from "next/server";
import { getQuizCards } from "@/lib/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const cards = getQuizCards(lang);
  return NextResponse.json(cards);
}
