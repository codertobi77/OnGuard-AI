import { z } from "zod";
import {
  DURATIONS,
  LANGS,
  LESION_LOCATIONS,
  MAX_IMAGE_BASE64_LENGTH,
  RISK_LEVELS,
  SYMPTOMS,
} from "@/types";

/** Anonymized clinical profile of a lesion (Step 1 contract). */
export const clinicalDataSchema = z.object({
  lesionLocation: z.enum(LESION_LOCATIONS),
  duration: z.enum(DURATIONS),
  symptoms: z.array(z.enum(SYMPTOMS)),
  familyHistory: z.boolean(),
});

/** Body of POST /api/analyze. */
export const analyzeRequestSchema = z.object({
  clinicalData: clinicalDataSchema,
  imageBase64: z.string().min(64).max(MAX_IMAGE_BASE64_LENGTH),
  imageMimeType: z.enum(["image/jpeg", "image/png"]).default("image/jpeg"),
  lang: z.enum(LANGS).default("en"),
});

/** Strict structured output contract for both AI engines (spec-exact JSON). */
export const analysisResultSchema = z.object({
  riskScore: z.number().min(0).max(10),
  riskLevel: z.enum(RISK_LEVELS),
  abcdeAssessment: z.object({
    asymmetry: z.string().min(1),
    border: z.string().min(1),
    color: z.string().min(1),
    diameter: z.string().min(1),
  }),
  clinicalRationale: z.string().min(1),
  recommendation: z.string().min(1),
});

/** Body of POST /api/report — either a database id or the full inline result. */
export const reportRequestSchema = z
  .object({
    assessmentId: z.uuid().optional(),
    result: analysisResultSchema.optional(),
    clinicalData: clinicalDataSchema.optional(),
    createdAt: z.string().optional(),
    lang: z.enum(LANGS).default("en"),
    format: z.enum(["pdf", "json"]).default("pdf"),
    model: z.string().optional(),
    demoMode: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.assessmentId !== undefined ||
      (data.result !== undefined && data.clinicalData !== undefined),
    {
      message:
        "Provide either an assessmentId or the full analysis result with clinical data.",
    },
  );

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type ReportRequest = z.infer<typeof reportRequestSchema>;
