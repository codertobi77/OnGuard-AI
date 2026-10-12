import type {
  Duration,
  Lang,
  LesionLocation,
  RiskLevel,
  Symptom,
} from "@/types";

/**
 * Canonical bilingual labels for domain values.
 * Used by the report PDF, the heuristic engine and the dashboard (server side),
 * where the React i18n context is not available.
 */

export const locationLabels: Record<Lang, Record<LesionLocation, string>> = {
  en: {
    face: "Face",
    scalp: "Scalp",
    neck: "Neck",
    chest: "Chest",
    back: "Back",
    abdomen: "Abdomen",
    arm: "Arm",
    hand: "Hand",
    leg: "Leg",
    foot: "Foot",
  },
  fr: {
    face: "Visage",
    scalp: "Cuir chevelu",
    neck: "Cou",
    chest: "Thorax",
    back: "Dos",
    abdomen: "Abdomen",
    arm: "Bras",
    hand: "Main",
    leg: "Jambe",
    foot: "Pied",
  },
};

export const durationLabels: Record<Lang, Record<Duration, string>> = {
  en: {
    "lt-1-month": "Less than 1 month",
    "1-6-months": "1 to 6 months",
    "gt-6-months": "More than 6 months",
  },
  fr: {
    "lt-1-month": "Moins d'1 mois",
    "1-6-months": "1 à 6 mois",
    "gt-6-months": "Plus de 6 mois",
  },
};

export const symptomLabels: Record<Lang, Record<Symptom, string>> = {
  en: {
    itching: "Itching",
    bleeding: "Bleeding",
    "size-color-change": "Change in size or color",
    pain: "Pain",
  },
  fr: {
    itching: "Démangeaisons",
    bleeding: "Saignements",
    "size-color-change": "Changement de taille/couleur",
    pain: "Douleur",
  },
};

export const riskLevelLabels: Record<Lang, Record<RiskLevel, string>> = {
  en: {
    "Low Risk": "Low Risk",
    "Moderate Risk": "Moderate Risk",
    "High Risk": "High Risk",
  },
  fr: {
    "Low Risk": "Risque faible",
    "Moderate Risk": "Risque modéré",
    "High Risk": "Risque élevé",
  },
};
