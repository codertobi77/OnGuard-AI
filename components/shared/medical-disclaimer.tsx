"use client";

import { TriangleAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function MedicalDisclaimer({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Alert className={className}>
      <TriangleAlert className="size-4" aria-hidden="true" />
      <AlertTitle>{t("disclaimer.title")}</AlertTitle>
      <AlertDescription>{t("disclaimer.text")}</AlertDescription>
    </Alert>
  );
}
