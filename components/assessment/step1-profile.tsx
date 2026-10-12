"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { durationLabels, locationLabels, symptomLabels } from "@/lib/labels";
import { useAssessmentStore } from "@/store/assessment";
import { DURATIONS, LESION_LOCATIONS, SYMPTOMS } from "@/types";
import type {
  ClinicalData,
  Duration,
  LesionLocation,
  Symptom,
} from "@/types";

interface Step1ProfileProps {
  onNext: () => void;
}

export function Step1Profile({ onNext }: Step1ProfileProps) {
  const clinicalData = useAssessmentStore((state) => state.clinicalData);
  const setClinicalData = useAssessmentStore((state) => state.setClinicalData);
  const { lang, t } = useI18n();

  const [location, setLocation] = useState<LesionLocation | "">(
    clinicalData?.lesionLocation ?? "",
  );
  const [duration, setDuration] = useState<Duration | "">(
    clinicalData?.duration ?? "",
  );
  const [symptoms, setSymptoms] = useState<Symptom[]>(
    clinicalData?.symptoms ?? [],
  );
  const [familyHistory, setFamilyHistory] = useState<"yes" | "no" | "">(
    clinicalData ? (clinicalData.familyHistory ? "yes" : "no") : "",
  );

  const canContinue =
    location !== "" && duration !== "" && familyHistory !== "";

  const toggleSymptom = (symptom: Symptom) => {
    setSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    );
  };

  const handleNext = () => {
    if (!location || !duration || !familyHistory) return;
    const data: ClinicalData = {
      lesionLocation: location,
      duration,
      symptoms,
      familyHistory: familyHistory === "yes",
    };
    setClinicalData(data);
    onNext();
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t("step1.title")}</CardTitle>
        <CardDescription>{t("step1.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Lesion location */}
        <div className="grid gap-2">
          <Label htmlFor="lesion-location">{t("step1.location")}</Label>
          <Select
            value={location}
            onValueChange={(value) => setLocation(value as LesionLocation)}
          >
            <SelectTrigger id="lesion-location" className="w-full">
              <SelectValue placeholder={t("step1.locationPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {LESION_LOCATIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {locationLabels[lang][item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="grid gap-2">
          <Label id="duration-label">{t("step1.duration")}</Label>
          <RadioGroup
            aria-labelledby="duration-label"
            value={duration}
            onValueChange={(value) => setDuration(value as Duration)}
            className="grid gap-2 sm:grid-cols-3"
          >
            {DURATIONS.map((option) => (
              <Label
                key={option}
                htmlFor={`duration-${option}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-input bg-card p-3 font-normal transition-colors hover:bg-accent/50 has-data-checked:border-primary has-data-checked:bg-accent"
              >
                <RadioGroupItem id={`duration-${option}`} value={option} />
                <span className="text-sm leading-snug">
                  {durationLabels[lang][option]}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Symptoms */}
        <div className="grid gap-2">
          <Label id="symptoms-label">
            {t("step1.symptoms")}
            <span className="font-normal text-muted-foreground">
              — {t("step1.symptomsHint")}
            </span>
          </Label>
          <div
            aria-labelledby="symptoms-label"
            className="grid gap-2 sm:grid-cols-2"
          >
            {SYMPTOMS.map((option) => (
              <Label
                key={option}
                htmlFor={`symptom-${option}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-input bg-card p-3 font-normal transition-colors hover:bg-accent/50 has-data-checked:border-primary has-data-checked:bg-accent"
              >
                <Checkbox
                  id={`symptom-${option}`}
                  checked={symptoms.includes(option)}
                  onCheckedChange={() => toggleSymptom(option)}
                />
                <span className="text-sm leading-snug">
                  {symptomLabels[lang][option]}
                </span>
              </Label>
            ))}
          </div>
        </div>

        {/* Family history */}
        <div className="grid gap-2">
          <Label id="family-history-label">{t("step1.familyHistory")}</Label>
          <RadioGroup
            aria-labelledby="family-history-label"
            value={familyHistory}
            onValueChange={(value) => setFamilyHistory(value as "yes" | "no")}
            className="grid grid-cols-2 gap-2"
          >
            {(["yes", "no"] as const).map((option) => (
              <Label
                key={option}
                htmlFor={`family-history-${option}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-input bg-card p-3 font-normal transition-colors hover:bg-accent/50 has-data-checked:border-primary has-data-checked:bg-accent"
              >
                <RadioGroupItem
                  id={`family-history-${option}`}
                  value={option}
                />
                <span className="text-sm">
                  {option === "yes" ? t("common.yes") : t("common.no")}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={handleNext} disabled={!canContinue}>
            {t("common.next")}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
