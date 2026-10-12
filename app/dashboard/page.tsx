import { Suspense } from "react";
import {
  DashboardClient,
  type DashboardRow,
} from "@/components/dashboard/dashboard-client";
import { getDb } from "@/lib/db";
import type { Duration, LesionLocation, RiskLevel, Symptom } from "@/types";

/**
 * Server component (Cache Components): the awaited database query below is
 * the suspension point, so this section is excluded from the static shell
 * and streams fresh data on each request. The database being unreachable
 * degrades gracefully to a demo-mode notice instead of an error page.
 */
async function DashboardData() {
  let rows: DashboardRow[] = [];
  let dbAvailable = true;

  try {
    const assessments = await getDb().assessment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    rows = assessments.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      lesionLocation: row.lesionLocation as LesionLocation,
      duration: row.duration as Duration,
      symptoms: row.symptoms as Symptom[],
      familyHistory: row.familyHistory,
      riskScore: row.riskScore,
      riskLevel: row.riskLevel as RiskLevel,
    }));
  } catch {
    dbAvailable = false;
  }

  return <DashboardClient rows={rows} dbAvailable={dbAvailable} />;
}

function DashboardFallback() {
  return (
    <div
      aria-busy="true"
      className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6"
    >
      <div className="grid gap-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardData />
    </Suspense>
  );
}
