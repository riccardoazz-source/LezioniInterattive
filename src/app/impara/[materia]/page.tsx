import { notFound } from "next/navigation";
import { SUBJECTS, SUBJECT_MAP } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { AppHeader } from "@/components/ui/AppHeader";
import { LessonList } from "@/components/LessonList";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ materia: s.id }));
}

export default async function MateriaPage({ params }: PageProps<"/impara/[materia]">) {
  const { materia } = await params;
  const subject = SUBJECT_MAP[materia as SubjectId];
  if (!subject) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={subject.name} emoji={subject.emoji} backHref="/impara" />
      <LessonList subject={subject.id} />
    </main>
  );
}
