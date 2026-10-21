"use client";

import { TriangleAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CollapsibleBanner } from "@/components/interior/collapsible-banner";

export function MedicalDisclaimer({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <CollapsibleBanner
      title={t("disclaimer.title")}
      description={t("disclaimer.text")}
      icon={<TriangleAlert className="size-4" aria-hidden="true" />}
      dismissLabel={t("disclaimer.dismiss")}
      dismissedMessage={t("disclaimer.dismissed")}
      className={className}
    />
  );
}
