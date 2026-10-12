import { NextResponse } from "next/server";
import { reportRequestSchema } from "@/lib/ai/schema";
import { buildReportPdf } from "@/lib/report";
import { getDb } from "@/lib/db";
import type {
  AnalysisResult,
  ClinicalData,
  LesionLocation,
  RiskLevel,
  Symptom,
  Duration,
} from "@/types";

/**
 * POST /api/report — report generation (PDF or JSON).
 *
 * Input : { assessmentId? , result?, clinicalData?, createdAt?, lang, format }
 * The preferred call (Step 4) sends the full inline result plus the optional
 * database id for traceability. When only an assessmentId is provided, the
 * archived row is fetched; per-criterion ABCDE details are not persisted
 * (spec-exact schema), so the report notes that explicitly.
 */

export const maxDuration = 60;

function filenameFor(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `onguard-report-${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}.pdf`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = reportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const {
    assessmentId,
    result,
    clinicalData,
    createdAt,
    lang,
    format,
    model,
    demoMode,
  } = parsed.data;

  let finalResult: AnalysisResult | undefined = result;
  let finalClinical: ClinicalData | undefined = clinicalData;
  let finalDate = createdAt ? new Date(createdAt) : new Date();
  let abcdeNotStored = false;

  if (assessmentId && (!finalResult || !finalClinical)) {
    try {
      const row = await getDb().assessment.findUnique({
        where: { id: assessmentId },
      });
      if (row) {
        finalDate = row.createdAt;
        finalClinical = {
          lesionLocation: row.lesionLocation as LesionLocation,
          duration: row.duration as Duration,
          symptoms: row.symptoms as Symptom[],
          familyHistory: row.familyHistory,
        };
        finalResult = {
          riskScore: row.riskScore,
          riskLevel: row.riskLevel as RiskLevel,
          abcdeAssessment: {
            asymmetry: "",
            border: "",
            color: "",
            diameter: "",
          },
          clinicalRationale: row.clinicalRationale,
          recommendation: row.recommendation,
        };
        abcdeNotStored = true;
      } else if (!finalResult) {
        return NextResponse.json(
          { error: "Assessment not found." },
          { status: 404 },
        );
      }
    } catch (error) {
      if (!finalResult || !finalClinical) {
        console.warn("[api/report] Database unavailable:", error);
        return NextResponse.json(
          { error: "Database unavailable and no inline report data provided." },
          { status: 503 },
        );
      }
    }
  }

  if (!finalResult || !finalClinical) {
    return NextResponse.json(
      {
        error:
          "A report requires either an assessmentId or a result with clinical data.",
      },
      { status: 400 },
    );
  }

  if (format === "json") {
    return NextResponse.json({
      result: finalResult,
      clinicalData: finalClinical,
      createdAt: finalDate.toISOString(),
      ...(assessmentId ? { assessmentId } : {}),
      abcdeNotStored,
    });
  }

  try {
    const bytes = await buildReportPdf({
      result: finalResult,
      clinicalData: finalClinical,
      createdAt: finalDate,
      lang,
      assessmentId,
      modelId: model,
      demoMode: demoMode ?? false,
      abcdeNotStored,
    });

    // BodyInit requires a standalone ArrayBuffer (pdf-lib returns a view).
    const body = new Uint8Array(bytes).buffer;

    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameFor(finalDate)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/report] PDF generation failed:", error);
    return NextResponse.json(
      { error: "Report generation failed." },
      { status: 500 },
    );
  }
}
