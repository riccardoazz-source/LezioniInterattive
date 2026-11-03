import { AppHeader } from "@/components/ui/AppHeader";
import { SubjectGrid } from "@/components/SubjectGrid";

export default function ImparaPage() {
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Impara" emoji="📚" backHref="/" />
      <SubjectGrid base="/impara" />
    </main>
  );
}
