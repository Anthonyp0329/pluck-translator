import { getQuizCards } from "@/lib/queries";
import QuizClient from "@/components/QuizClient";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const initialCards = getQuizCards(lang);

  return <QuizClient initialCards={initialCards} lang={lang} />;
}
