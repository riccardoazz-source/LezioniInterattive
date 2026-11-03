import { notFound } from "next/navigation";
import { LESSONS, LESSON_MAP } from "@/content/lessons";
import { SUBJECT_MAP } from "@/content/subjects";
import { AppHeader } from "@/components/ui/AppHeader";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ materia: l.subject, lezione: l.id }));
}

export default async function LezionePage({ params }: PageProps<"/impara/[materia]/[lezione]">) {
  const { lezione } = await params;
  const lesson = LESSON_MAP[lezione];
  if (!lesson) notFound();
  const subject = SUBJECT_MAP[lesson.subject];
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={lesson.title} emoji={lesson.emoji} backHref={`/impara/${lesson.subject}`} />
      <LessonPlayer lesson={lesson} />
      <p className="sr-only">{subject.name}</p>
    </main>
  );
}
