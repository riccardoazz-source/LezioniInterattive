import { AppHeader } from "@/components/ui/AppHeader";
import { SettingsForm } from "@/components/SettingsForm";

export default function ImpostazioniPage() {
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Impostazioni" emoji="⚙️" backHref="/" />
      <SettingsForm />
    </main>
  );
}
