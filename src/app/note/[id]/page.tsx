import { AppHeader } from "@/components/ui/AppHeader";
import { NoteEditor } from "@/components/notes/NoteEditor";

/**
 * Le note vivono nel browser (o su Neon): l'id non è noto al build,
 * quindi la pagina è resa a richiesta e il componente client carica la nota.
 */
export default async function NotaPage({ params }: PageProps<"/note/[id]">) {
  const { id } = await params;
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Quaderno" emoji="📓" backHref="/note" />
      <NoteEditor id={id} />
    </main>
  );
}
