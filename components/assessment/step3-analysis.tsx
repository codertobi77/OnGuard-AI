"use client";

import { useCallback, useEffect, useState } from "react";
import { BrainCircuit, LoaderCircle, RotateCcw, TriangleAlert } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { useAssessmentStore } from "@/store/assessment";
import type { AnalyzeResponse } from "@/types";

const ANALYSIS_MESSAGES = ["step3.msg1", "step3.msg2", "step3.msg3"] as const;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function Step3Analysis() {
  const clinicalData = useAssessmentStore((state) => state.clinicalData);
  const imageBase64 = useAssessmentStore((state) => state.imageBase64);
  const imageMimeType = useAssessmentStore((state) => state.imageMimeType);
  const setResponse = useAssessmentStore((state) => state.setResponse);
  const setStep = useAssessmentStore((state) => state.setStep);
  const { lang, t } = useI18n();

  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Rotate the status messages while the analysis is running.
  useEffect(() => {
    const timer = window.setInterval(
      () => setMessageIndex((index) => (index + 1) % ANALYSIS_MESSAGES.length),
      2400,
    );
    return () => window.clearInterval(timer);
  }, []);

  const runAnalysis = useCallback(
    async (signal?: AbortSignal) => {
      if (!clinicalData || !imageBase64) return;
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicalData,
            imageBase64,
            imageMimeType: imageMimeType ?? "image/jpeg",
            lang,
          }),
          signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as AnalyzeResponse;
        setResponse(data);
        setStep(4);
      } catch (caught) {
        if (isAbortError(caught)) return;
        setError(t("step3.error"));
      }
    },
    [clinicalData, imageBase64, imageMimeType, lang, setResponse, setStep, t],
  );

  // Run the analysis automatically on mount, deferred to a task so the
  // effect body only wires up the external call. The cleanup cancels a
  // pending run and aborts an in-flight request when the effect re-runs
  // (e.g. language change) or on unmount, so no stale result is committed.
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => void runAnalysis(controller.signal),
    );
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [runAnalysis]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t("step3.title")}</CardTitle>
        <CardDescription>{t("step3.desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="grid gap-4">
            <Alert variant="destructive">
              <TriangleAlert className="size-4" aria-hidden="true" />
              <AlertTitle>{t("step3.error")}</AlertTitle>
            </Alert>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setError(null);
                  void runAnalysis();
                }}
              >
                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                {t("common.retry")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-8">
            <span className="relative flex size-16 items-center justify-center rounded-full bg-accent text-primary">
              <BrainCircuit className="size-8" aria-hidden="true" />
              <LoaderCircle
                className="absolute -right-1 -bottom-1 size-5 animate-spin"
                aria-hidden="true"
              />
            </span>
            <div
              key={messageIndex}
              aria-live="polite"
              className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 text-center text-sm font-medium text-muted-foreground"
            >
              {t(ANALYSIS_MESSAGES[messageIndex])}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
