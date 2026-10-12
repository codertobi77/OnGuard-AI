import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/ai/schema";
import {
  getModelId,
  isOpenRouterConfigured,
  analyzeWithOpenRouter,
} from "@/lib/ai/openrouter";
import { analyzeHeuristically } from "@/lib/ai/heuristic";
import { getDb } from "@/lib/db";
import type { AnalyzeResponse, AnalysisResult } from "@/types";

/**
 * POST /api/analyze — multimodal risk analysis.
 *
 * Input : { clinicalData, imageBase64, imageMimeType?, lang? }
 * Engine: OpenRouter vision LLM when OPENROUTER_API_KEY is set,
 *         deterministic heuristic fallback otherwise (demo mode) or on error.
 * Persistence is best-effort: the assessment is stored when the database is
 * reachable, and the analysis still succeeds when it is not.
 */

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { clinicalData, imageBase64, imageMimeType, lang } = parsed.data;

  let result: AnalysisResult;
  let engine: AnalyzeResponse["engine"] = "heuristic";
  let model: string | undefined;
  let demoMode = true;

  if (isOpenRouterConfigured()) {
    try {
      result = await analyzeWithOpenRouter({
        clinicalData,
        imageBase64,
        imageMimeType,
        lang,
      });
      engine = "openrouter";
      model = getModelId();
      demoMode = false;
    } catch (error) {
      console.error(
        "[api/analyze] OpenRouter engine failed, falling back to heuristic:",
        error,
      );
      result = analyzeHeuristically({ clinicalData, imageBase64, lang });
    }
  } else {
    result = analyzeHeuristically({ clinicalData, imageBase64, lang });
  }

  // Best-effort persistence of the anonymized assessment.
  let assessmentId: string | undefined;
  try {
    const saved = await getDb().assessment.create({
      data: {
        lesionLocation: clinicalData.lesionLocation,
        duration: clinicalData.duration,
        symptoms: clinicalData.symptoms,
        familyHistory: clinicalData.familyHistory,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        clinicalRationale: result.clinicalRationale,
        recommendation: result.recommendation,
      },
      select: { id: true },
    });
    assessmentId = saved.id;
  } catch (error) {
    console.warn(
      "[api/analyze] Assessment not persisted:",
      error instanceof Error ? error.message : error,
    );
  }

  const payload: AnalyzeResponse = {
    result,
    ...(assessmentId ? { assessmentId } : {}),
    engine,
    ...(model ? { model } : {}),
    demoMode,
  };

  return NextResponse.json(payload);
}
