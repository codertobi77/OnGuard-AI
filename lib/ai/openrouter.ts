import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import type {
  AnalysisResult,
  ClinicalData,
  ImageMimeType,
  Lang,
} from "@/types";
import { analysisResultSchema } from "./schema";
import {
  buildAnalysisSystemPrompt,
  buildAnalysisUserPrompt,
} from "./prompts";

/**
 * Vision-language engine backed by OpenRouter (Vercel AI SDK v7).
 * Default model: z-ai/glm-4.5v (image input + structured output).
 * Override with the AI_MODEL environment variable.
 */

export const DEFAULT_MODEL = "z-ai/glm-4.5v";

export function getModelId(): string {
  return process.env.AI_MODEL?.trim() || DEFAULT_MODEL;
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export interface OpenRouterParams {
  clinicalData: ClinicalData;
  imageBase64: string;
  imageMimeType: ImageMimeType;
  lang: Lang;
}

export async function analyzeWithOpenRouter(
  params: OpenRouterParams,
): Promise<AnalysisResult> {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const model = openrouter.chat(getModelId(), {
    // Repairs malformed model JSON so the strict schema is reliably satisfied.
    plugins: [{ id: "response-healing" }],
  });

  const { object } = await generateObject({
    model,
    schema: analysisResultSchema,
    system: buildAnalysisSystemPrompt(params.lang),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            mediaType: params.imageMimeType,
            data: params.imageBase64,
          },
          {
            type: "text",
            text: buildAnalysisUserPrompt(params.clinicalData, params.lang),
          },
        ],
      },
    ],
    // Vision models with reasoning can be slow; keep it under the route budget.
    abortSignal: AbortSignal.timeout(55_000),
  });

  return object;
}
