"use client";

import Link from "next/link";
import { ClipboardList, Database } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  locationLabels,
  riskLevelLabels,
  symptomLabels,
} from "@/lib/labels";
import { riskBadgeClass, riskTextClass } from "@/lib/risk";
import type { Duration, LesionLocation, RiskLevel, Symptom } from "@/types";

export interface DashboardRow {
  id: string;
  createdAt: string;
  lesionLocation: LesionLocation;
  duration: Duration;
  symptoms: Symptom[];
  familyHistory: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
}

interface DashboardClientProps {
  rows: DashboardRow[];
  dbAvailable: boolean;
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-1">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className={cn("font-heading text-2xl font-semibold", valueClass)}>
          {value}
        </span>
      </CardContent>
    </Card>
  );
}

export function DashboardClient({ rows, dbAvailable }: DashboardClientProps) {
  const { lang, t } = useI18n();

  const total = rows.length;
  const averageScore =
    total > 0
      ? rows.reduce((sum, row) => sum + row.riskScore, 0) / total
      : 0;
  const highRiskCount = rows.filter(
    (row) => row.riskLevel === "High Risk",
  ).length;
  const dateFormatter = new Intl.DateTimeFormat(
    lang === "fr" ? "fr-FR" : "en-GB",
    { dateStyle: "medium", timeStyle: "short" },
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-10 sm:px-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </header>

      {!dbAvailable ? (
        <div className="grid gap-4">
          <Alert>
            <Database className="size-4" aria-hidden="true" />
            <AlertDescription>{t("dashboard.dbUnavailable")}</AlertDescription>
          </Alert>
          <div>
            <Button asChild className="w-fit">
              <Link href="/assess">{t("dashboard.viewCta")}</Link>
            </Button>
          </div>
        </div>
      ) : total === 0 ? (
        <Card className="mx-auto w-full max-w-md text-center">
          <CardContent className="grid justify-center gap-4 py-4">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary">
              <ClipboardList className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">{t("dashboard.empty")}</p>
            <Button asChild className="mx-auto">
              <Link href="/assess">{t("dashboard.viewCta")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label={t("dashboard.total")} value={String(total)} />
            <StatCard
              label={t("dashboard.avgScore")}
              value={averageScore.toFixed(1)}
            />
            <StatCard
              label={t("dashboard.highRisk")}
              value={String(highRiskCount)}
              valueClass={highRiskCount > 0 ? "text-red-600" : undefined}
            />
          </div>

          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("dashboard.date")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("dashboard.location")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("dashboard.score")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {t("dashboard.level")}
                    </th>
                    <th scope="col" className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      {t("dashboard.symptoms")}
                    </th>
                    <th scope="col" className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                      {t("dashboard.familyHistory")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {dateFormatter.format(new Date(row.createdAt))}
                      </td>
                      <td className="px-4 py-3">
                        {locationLabels[lang][row.lesionLocation]}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 font-semibold",
                          riskTextClass(row.riskLevel),
                        )}
                      >
                        {row.riskScore.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={riskBadgeClass(row.riskLevel)}
                        >
                          {riskLevelLabels[lang][row.riskLevel]}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {row.symptoms.length
                          ? row.symptoms
                              .map((symptom) => symptomLabels[lang][symptom])
                              .join(", ")
                          : t("dashboard.noSymptoms")}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {row.familyHistory ? t("common.yes") : t("common.no")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
