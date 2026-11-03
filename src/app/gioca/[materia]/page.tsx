import { notFound } from "next/navigation";
import { SUBJECTS, SUBJECT_MAP } from "@/content/subjects";
import type { SubjectId } from "@/content/types";
import { AppHeader } from "@/components/ui/AppHeader";
import { GameGrid } from "@/components/GameGrid";

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ materia: s.id }));
}

export default async function GiocaMateriaPage({ params }: PageProps<"/gioca/[materia]">) {
  const { materia } = await params;
  const subject = SUBJECT_MAP[materia as SubjectId];
  if (!subject) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={`Giochi di ${subject.name}`} emoji={subject.emoji} backHref="/gioca" />
      <GameGrid subject={subject.id} />
    </main>
  );
}
