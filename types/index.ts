/**
 * OnGuard AI — Shared domain types.
 * Strictly typed contracts shared by the UI, the API routes and the AI engines.
 */

// ---------------------------------------------------------------------------
// Clinical profile (Step 1) — anonymized data only
// ---------------------------------------------------------------------------

export const LESION_LOCATIONS = [
  "face",
  "scalp",
  "neck",
  "chest",
  "back",
  "abdomen",
  "arm",
  "hand",
  "leg",
  "foot",
] as const;

export type LesionLocation = (typeof LESION_LOCATIONS)[number];

export const DURATIONS = ["lt-1-month", "1-6-months", "gt-6-months"] as const;

export type Duration = (typeof DURATIONS)[number];

export const SYMPTOMS = ["itching", "bleeding", "size-color-change", "pain"] as const;

export type Symptom = (typeof SYMPTOMS)[number];

export const FAMILY_HISTORY_OPTIONS = ["yes", "no"] as const;

export interface ClinicalData {
  /** Body area where the lesion is located. */
  lesionLocation: LesionLocation;
  /** How long ago the lesion appeared. */
  duration: Duration;
  /** Associated symptoms reported by the patient. */
  symptoms: Symptom[];
  /** Personal or family history of skin cancer. */
  familyHistory: boolean;
}

// ---------------------------------------------------------------------------
// AI analysis output (strict contract from the functional specification)
// ---------------------------------------------------------------------------

/** ABCDE visual criteria assessed on the dermoscopic image. */
export interface AbcdeAssessment {
  asymmetry: string;
  border: string;
  color: string;
  diameter: string;
}

export const RISK_LEVELS = ["Low Risk", "Moderate Risk", "High Risk"] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

/** Structured multimodal analysis result (exact JSON shape of the spec). */
export interface AnalysisResult {
  /** Unified risk score, 0 (lowest) to 10 (highest). */
  riskScore: number;
  riskLevel: RiskLevel;
  abcdeAssessment: AbcdeAssessment;
  clinicalRationale: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// API envelopes
// ---------------------------------------------------------------------------

/** Engine that produced the result: the vision LLM or the built-in heuristic. */
export type Engine = "openrouter" | "heuristic";

export type ImageMimeType = "image/jpeg" | "image/png";

/** Response of POST /api/analyze. */
export interface AnalyzeResponse {
  result: AnalysisResult;
  /** Database id, present when persistence succeeded. */
  assessmentId?: string;
  engine: Engine;
  /** OpenRouter model id, present when the vision engine was used. */
  model?: string;
  /** True when the deterministic heuristic fallback produced the result. */
  demoMode: boolean;
}

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

export const LANGS = ["en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

// ---------------------------------------------------------------------------
// Constraints (shared between client validation and API validation)
// ---------------------------------------------------------------------------

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
/** Images are downscaled client-side before upload; base64 adds ~33%. */
export const MAX_IMAGE_BASE64_LENGTH = 14 * 1024 * 1024;
