"use client";

import { useState, type ReactNode } from "react";
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
import { SegmentedControl } from "@/components/interior/segmented-control";
import {
  SortableTable,
  type SortableColumn,
} from "@/components/interior/sortable-table";
import { StickyHeader } from "@/components/interior/sticky-header";
import { ValueFlash } from "@/components/interior/value-flash";
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
  value: ReactNode;
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

  const [filter, setFilter] = useState<"all" | "high">("all");
  const visibleRows =
    filter === "high"
      ? rows.filter((row) => row.riskLevel === "High Risk")
      : rows;

  const total = visibleRows.length;
  const averageScore =
    total > 0
      ? visibleRows.reduce((sum, row) => sum + row.riskScore, 0) / total
      : 0;
  const highRiskCount = visibleRows.filter(
    (row) => row.riskLevel === "High Risk",
  ).length;
  const dateFormatter = new Intl.DateTimeFormat(
    lang === "fr" ? "fr-FR" : "en-GB",
    { dateStyle: "medium", timeStyle: "short" },
  );

  const pageHeader = (
    <header className="grid gap-1">
      <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("dashboard.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
    </header>
  );

  const columns: SortableColumn<DashboardRow>[] = [
    {
      id: "date",
      header: t("dashboard.date"),
      width: "176px",
      numeric: true,
      value: (row) => new Date(row.createdAt).getTime(),
      cell: (row) => dateFormatter.format(new Date(row.createdAt)),
    },
    {
      id: "location",
      header: t("dashboard.location"),
      value: (row) => locationLabels[lang][row.lesionLocation],
    },
    {
      id: "score",
      header: t("dashboard.score"),
      width: "72px",
      numeric: true,
      align: "end",
      value: (row) => row.riskScore,
      cell: (row) => (
        <span className={cn("font-semibold", riskTextClass(row.riskLevel))}>
          {row.riskScore.toFixed(1)}
        </span>
      ),
    },
    {
      id: "level",
      header: t("dashboard.level"),
      width: "128px",
      value: (row) => riskLevelLabels[lang][row.riskLevel],
      cell: (row) => (
        <Badge variant="outline" className={riskBadgeClass(row.riskLevel)}>
          {riskLevelLabels[lang][row.riskLevel]}
        </Badge>
      ),
    },
    {
      id: "symptoms",
      header: t("dashboard.symptoms"),
      value: (row) =>
        row.symptoms.length
          ? row.symptoms
              .map((symptom) => symptomLabels[lang][symptom])
              .join(", ")
          : t("dashboard.noSymptoms"),
    },
    {
      id: "familyHistory",
      header: t("dashboard.familyHistory"),
      width: "104px",
      numeric: true,
      value: (row) => (row.familyHistory ? 1 : 0),
      cell: (row) => (row.familyHistory ? t("common.yes") : t("common.no")),
    },
  ];

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-10 sm:px-6">
      {!dbAvailable ? (
        <>
          {pageHeader}
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
        </>
      ) : rows.length === 0 ? (
        <>
          {pageHeader}
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
        </>
      ) : (
        <StickyHeader
          title={t("dashboard.title")}
          subtitle={t("dashboard.subtitle")}
          maxHeight={640}
          actions={
            <SegmentedControl
              options={[
                { value: "all", label: t("dashboard.filterAll") },
                { value: "high", label: t("dashboard.filterHigh") },
              ]}
              label={t("dashboard.filterLabel")}
              value={filter}
              onValueChange={(next) =>
                setFilter(next === "high" ? "high" : "all")
              }
            />
          }
        >
          <div className="grid gap-4 px-4 pb-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label={t("dashboard.total")} value={String(total)} />
              <StatCard
                label={t("dashboard.avgScore")}
                value={
                  <ValueFlash
                    value={Number(averageScore.toFixed(1))}
                    format={(v) => v.toFixed(1)}
                    label={t("dashboard.avgScore")}
                    className="text-2xl! font-semibold!"
                  />
                }
              />
              <StatCard
                label={t("dashboard.highRisk")}
                value={String(highRiskCount)}
                valueClass={highRiskCount > 0 ? "text-red-600" : undefined}
              />
            </div>

            <SortableTable
              rows={visibleRows}
              columns={columns}
              getRowId={(row) => row.id}
              label={t("dashboard.tableLabel")}
              rowHeight={44}
              markable
              defaultSort={{ columnId: "date", direction: "desc" }}
              getRowLabel={(row) =>
                `${locationLabels[lang][row.lesionLocation]} — ${dateFormatter.format(new Date(row.createdAt))}`
              }
            />
          </div>
        </StickyHeader>
      )}
    </div>
  );
}
