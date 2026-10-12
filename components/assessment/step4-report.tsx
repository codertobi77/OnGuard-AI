"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileDown,
  FileJson,
  LayoutDashboard,
  LoaderCircle,
  RotateCcw,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  durationLabels,
  locationLabels,
  symptomLabels,
} from "@/lib/labels";
import { riskAccentClass } from "@/lib/risk";
import { RiskGauge } from "./risk-gauge";
import { useAssessmentStore } from "@/store/assessment";
import type { AnalyzeResponse } from "@/types";

type ReportFormat = "pdf" | "json";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg border bg-muted/30 p-3">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm leading-snug">{value}</span>
    </div>
  );
}

export function Step4Report({ response }: { response: AnalyzeResponse }) {
  const clinicalData = useAssessmentStore((state) => state.clinicalData);
  const reset = useAssessmentStore((state) => state.reset);
  const { lang, t } = useI18n();

  const [downloading, setDownloading] = useState<ReportFormat | null>(null);
  const [downloadError, setDownloadError] = useState(false);

  const { result } = response;
  const level = result.riskLevel;

  const abcdeRows = [
    { key: "step4.asymmetry", value: result.abcdeAssessment.asymmetry },
    { key: "step4.border", value: result.abcdeAssessment.border },
    { key: "step4.color", value: result.abcdeAssessment.color },
    { key: "step4.diameter", value: result.abcdeAssessment.diameter },
  ] as const;

  const downloadReport = async (format: ReportFormat) => {
    if (!clinicalData) return;
    setDownloading(format);
    setDownloadError(false);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: response.assessmentId,
          result,
          clinicalData,
          lang,
          format,
          model: response.model,
          demoMode: response.demoMode,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/i);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        match?.[1] ??
        `onguard-report-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      {/* Score + gauge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {t("step4.score")}
            {response.demoMode && (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-700"
              >
                {t("step4.demoBadge")}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{t("step4.scoreHint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <RiskGauge score={result.riskScore} level={level} />
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t("step4.engineLabel")}:{" "}
              {response.engine === "openrouter"
                ? t("step4.engineOpenrouter")
                : t("step4.engineHeuristic")}
              {response.model ? ` (${response.model})` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  response.assessmentId ? "bg-green-500" : "bg-amber-500",
                )}
                aria-hidden="true"
              />
              {response.assessmentId
                ? t("step4.saved")
                : t("step4.notSaved")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ABCDE visual analysis */}
      <Card>
        <CardHeader>
          <CardTitle>{t("step4.visualTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {abcdeRows.map((row) => (
            <div
              key={row.key}
              className="grid gap-1 rounded-lg border bg-muted/30 p-3"
            >
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t(row.key)}
              </span>
              <span className="text-sm leading-snug">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Clinical profile summary */}
      {clinicalData && (
        <Card>
          <CardHeader>
            <CardTitle>{t("step4.clinicalTitle")}</CardTitle>
            <CardDescription>{t("step4.clinicalHint")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <SummaryRow
              label={t("step1.location")}
              value={locationLabels[lang][clinicalData.lesionLocation]}
            />
            <SummaryRow
              label={t("step1.duration")}
              value={durationLabels[lang][clinicalData.duration]}
            />
            <SummaryRow
              label={t("step1.symptoms")}
              value={
                clinicalData.symptoms.length
                  ? clinicalData.symptoms
                      .map((symptom) => symptomLabels[lang][symptom])
                      .join(", ")
                  : t("dashboard.noSymptoms")
              }
            />
            <SummaryRow
              label={t("step1.familyHistory")}
              value={
                clinicalData.familyHistory ? t("common.yes") : t("common.no")
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Rationale + recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("step4.rationaleTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            {result.clinicalRationale}
          </p>
          <Alert className={riskAccentClass(level)}>
            <Stethoscope className="size-4" aria-hidden="true" />
            <AlertTitle>{t("step4.recommendationTitle")}</AlertTitle>
            <AlertDescription className="text-foreground">
              {result.recommendation}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {downloadError && (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" aria-hidden="true" />
          <AlertTitle>{t("step4.downloadError")}</AlertTitle>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        <Button
          onClick={() => void downloadReport("pdf")}
          disabled={downloading !== null}
        >
          {downloading === "pdf" ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <FileDown data-icon="inline-start" aria-hidden="true" />
          )}
          {t("step4.downloadPdf")}
        </Button>
        <Button
          variant="outline"
          onClick={() => void downloadReport("json")}
          disabled={downloading !== null}
        >
          {downloading === "json" ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <FileJson data-icon="inline-start" aria-hidden="true" />
          )}
          {t("step4.downloadJson")}
        </Button>
        <Button variant="outline" onClick={reset}>
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          {t("step4.newAssessment")}
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            {t("step4.viewDashboard")}
            <LayoutDashboard data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
