import { create } from "zustand";
import type { AnalyzeResponse, ClinicalData, ImageMimeType } from "@/types";

export const TOTAL_STEPS = 4;

interface AssessmentState {
  /** Current wizard step, 1 to 4. */
  step: number;
  clinicalData: ClinicalData | null;
  /** Downscaled image as a data URL (base64), ready for preview and upload. */
  imageDataUrl: string | null;
  imageMimeType: ImageMimeType | null;
  /** Base64 payload without the data: prefix, sent to /api/analyze. */
  imageBase64: string | null;
  response: AnalyzeResponse | null;
  setStep: (step: number) => void;
  setClinicalData: (data: ClinicalData) => void;
  setImage: (dataUrl: string, mimeType: ImageMimeType) => void;
  clearImage: () => void;
  setResponse: (response: AnalyzeResponse) => void;
  reset: () => void;
}

function base64FromDataUrl(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  step: 1,
  clinicalData: null,
  imageDataUrl: null,
  imageMimeType: null,
  imageBase64: null,
  response: null,
  setStep: (step) => set({ step: Math.min(Math.max(step, 1), TOTAL_STEPS) }),
  setClinicalData: (clinicalData) => set({ clinicalData }),
  setImage: (dataUrl, mimeType) =>
    set({
      imageDataUrl: dataUrl,
      imageMimeType: mimeType,
      imageBase64: base64FromDataUrl(dataUrl),
      response: null,
    }),
  clearImage: () =>
    set({ imageDataUrl: null, imageMimeType: null, imageBase64: null, response: null }),
  setResponse: (response) => set({ response }),
  reset: () =>
    set({
      step: 1,
      clinicalData: null,
      imageDataUrl: null,
      imageMimeType: null,
      imageBase64: null,
      response: null,
    }),
}));
