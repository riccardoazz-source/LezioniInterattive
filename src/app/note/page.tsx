import { AppHeader } from "@/components/ui/AppHeader";
import { NotesList } from "@/components/notes/NotesList";

export default function NotePage() {
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Note" emoji="📓" backHref="/" />
      <NotesList />
    </main>
  );
}
