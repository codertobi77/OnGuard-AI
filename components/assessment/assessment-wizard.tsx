"use client";

import { useEffect, useMemo } from "react";
import { BrainCircuit, ClipboardList, FileText, ImageUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  useWizard,
  type WizardDirection,
} from "@/components/interior/wizard-steps";
import { TOTAL_STEPS, useAssessmentStore } from "@/store/assessment";
import { Step1Profile } from "./step1-profile";
import { Step2ImageUpload } from "./step2-image-upload";
import { Step3Analysis } from "./step3-analysis";
import { Step4Report } from "./step4-report";

const STEP_META = [
  { icon: ClipboardList, labelKey: "assess.step1" },
  { icon: ImageUp, labelKey: "assess.step2" },
  { icon: BrainCircuit, labelKey: "assess.step3" },
  { icon: FileText, labelKey: "assess.step4" },
] as const;

type StepState = "done" | "active" | "upcoming";

const CROSSFADE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;
const EXIT_EASE = [0.4, 0, 1, 1] as const;

export function AssessmentWizard() {
  const step = useAssessmentStore((state) => state.step);
  const clinicalData = useAssessmentStore((state) => state.clinicalData);
  const imageBase64 = useAssessmentStore((state) => state.imageBase64);
  const response = useAssessmentStore((state) => state.response);
  const setStep = useAssessmentStore((state) => state.setStep);
  const { t } = useI18n();

  // Never render a step whose prerequisites are missing (e.g. after a store
  // reset or a replaced image): fall back to the latest valid step.
  let effectiveStep = step;
  if (effectiveStep >= 2 && !clinicalData) effectiveStep = 1;
  else if (effectiveStep >= 3 && !imageBase64) effectiveStep = 2;
  else if (effectiveStep >= 4 && !response) effectiveStep = 3;

  useEffect(() => {
    if (effectiveStep !== step) setStep(effectiveStep);
  }, [effectiveStep, step, setStep]);

  const reduced = useReducedMotion();
  const wizard = useWizard({
    total: TOTAL_STEPS,
    index: effectiveStep - 1,
    onIndexChange: (index) => setStep(index + 1),
  });

  const variants = useMemo(
    () => ({
      enter: (d: WizardDirection) =>
        reduced ? { opacity: 0 } : { opacity: 0, x: d * 22 },
      center: reduced ? { opacity: 1 } : { opacity: 1, x: 0 },
      exit: (d: WizardDirection) =>
        reduced
          ? { opacity: 0, transition: { duration: 0 } }
          : {
              opacity: 0,
              x: d * -22,
              transition: { duration: 0.14, ease: EXIT_EASE },
            },
    }),
    [reduced],
  );

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <header className="grid gap-4">
        <div className="grid gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("assess.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("assess.subtitle")}</p>
        </div>
        <nav aria-label={t("assess.title")} className="grid gap-3">
          <ol className="flex flex-wrap items-center justify-center gap-2">
            {STEP_META.map((meta, index) => {
              const stepNumber = index + 1;
              const state: StepState =
                stepNumber < effectiveStep
                  ? "done"
                  : stepNumber === effectiveStep
                    ? "active"
                    : "upcoming";
              const Icon = meta.icon;
              return (
                <li key={meta.labelKey}>
                  <button
                    type="button"
                    disabled={state !== "done"}
                    onClick={() => wizard.goTo(index)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      state === "active" &&
                        "border-primary bg-primary text-primary-foreground",
                      state === "done" &&
                        "cursor-pointer border-primary/40 bg-accent text-foreground hover:bg-accent/70",
                      state === "upcoming" && "border-input text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {t(meta.labelKey)}
                  </button>
                </li>
              );
            })}
          </ol>
          <Progress
            value={((effectiveStep - 1) / (TOTAL_STEPS - 1)) * 100}
            aria-label={`${t("assess.title")} — ${effectiveStep} / ${TOTAL_STEPS}`}
          />
        </nav>
      </header>

      <AnimatePresence initial={false} custom={wizard.direction} mode="wait">
        <motion.div
          key={effectiveStep}
          custom={wizard.direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reduced ? { duration: 0 } : CROSSFADE}
        >
          {effectiveStep === 1 && <Step1Profile onNext={() => setStep(2)} />}
          {effectiveStep === 2 && (
            <Step2ImageUpload onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {effectiveStep === 3 && <Step3Analysis />}
          {effectiveStep === 4 && response && <Step4Report response={response} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
