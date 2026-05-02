import { redirect } from "next/navigation";

import { venueConfig } from "@/config/venue.config";
import { ThemeEditorPage } from "@/features/theme-editor";

export default function AdminThemePage() {
  if (!venueConfig.features.enableThemeEditor) {
    redirect("/");
  }

  return (
    <section className="py-4">
      <ThemeEditorPage />
    </section>
  );
}
