import type {
  AbcdeAssessment,
  AnalysisResult,
  ClinicalData,
  Duration,
  Lang,
  LesionLocation,
  RiskLevel,
  Symptom,
} from "@/types";
import { durationLabels, locationLabels } from "@/lib/labels";

/**
 * Deterministic heuristic engine (demo mode).
 *
 * Produces the same structured contract as the vision LLM without any API key,
 * by cross-referencing weighted clinical risk factors. A small deterministic
 * jitter is derived from the image bytes so that different images yield
 * slightly different demo outputs while remaining fully reproducible.
 */

// ---------------------------------------------------------------------------
// Deterministic pseudo-random helpers
// ---------------------------------------------------------------------------

/** FNV-1a hash — stable across runtimes. */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG seeded by the image hash. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Weighted clinical scoring
// ---------------------------------------------------------------------------

const SYMPTOM_WEIGHTS: Record<Symptom, number> = {
  // Bleeding and recent evolution are major melanoma red flags.
  bleeding: 2.6,
  "size-color-change": 2.0,
  itching: 0.7,
  pain: 0.6,
};

const DURATION_WEIGHTS: Record<Duration, number> = {
  // A lesion appearing recently plus evolving is more concerning.
  "lt-1-month": 0.9,
  "1-6-months": 0.7,
  "gt-6-months": 0.4,
};

const LOCATION_WEIGHTS: Record<LesionLocation, number> = {
  // Hard-to-monitor areas (back, scalp, chest) carry slightly more weight.
  back: 0.5,
  chest: 0.3,
  abdomen: 0.3,
  scalp: 0.3,
  face: 0.2,
  neck: 0.2,
  leg: 0.2,
  arm: 0.1,
  hand: 0.1,
  foot: 0.1,
};

const FAMILY_HISTORY_WEIGHT = 1.1;
const BASE_SCORE = 0.6;

export function computeHeuristicScore(
  clinicalData: ClinicalData,
  imageSeed: number,
): number {
  let score = BASE_SCORE;
  for (const symptom of clinicalData.symptoms) {
    score += SYMPTOM_WEIGHTS[symptom];
  }
  score += DURATION_WEIGHTS[clinicalData.duration];
  score += LOCATION_WEIGHTS[clinicalData.lesionLocation];
  if (clinicalData.familyHistory) {
    score += FAMILY_HISTORY_WEIGHT;
  }
  // Deterministic image-derived jitter in [-0.28, +0.52].
  const rng = mulberry32(imageSeed);
  score += (rng() - 0.35) * 0.8;

  return Math.round(Math.min(Math.max(score, 0.5), 9.8) * 10) / 10;
}

export function levelFromScore(score: number): RiskLevel {
  if (score < 4) return "Low Risk";
  if (score < 7) return "Moderate Risk";
  return "High Risk";
}

// ---------------------------------------------------------------------------
// Bilingual narrative templates
// ---------------------------------------------------------------------------

type Tier = "low" | "moderate" | "high";

function tierFromScore(score: number): Tier {
  if (score < 4) return "low";
  if (score < 7) return "moderate";
  return "high";
}

const ABCDE_TEMPLATES: Record<Lang, Record<Tier, AbcdeAssessment>> = {
  en: {
    low: {
      asymmetry: "Regular, symmetrical outline with no significant asymmetry along either axis.",
      border: "Smooth, well-defined and regular borders.",
      color: "Uniform pigmentation without suspicious color variegation.",
      diameter: "Estimated below 6 mm.",
    },
    moderate: {
      asymmetry: "Mild asymmetry noticeable on one of the two axes.",
      border: "Slightly irregular or blurred margins in places.",
      color: "Localized pigmentation heterogeneity worth monitoring.",
      diameter: "Estimated around 6 mm.",
    },
    high: {
      asymmetry: "High asymmetry detected on the longitudinal axis.",
      border: "Irregular and poorly defined margins.",
      color: "Heterogeneous pigmentation (dark brown and black shades).",
      diameter: "Estimated greater than 6 mm.",
    },
  },
  fr: {
    low: {
      asymmetry: "Contour régulier et symétrique, sans asymétrie notable sur les deux axes.",
      border: "Bordures lisses, nettes et régulières.",
      color: "Pigmentation homogène, sans variegation suspecte.",
      diameter: "Estimé inférieur à 6 mm.",
    },
    moderate: {
      asymmetry: "Légère asymétrie perceptible sur l'un des deux axes.",
      border: "Bordures légèrement irrégulières ou floues par endroits.",
      color: "Hétérogénéité localisée de la pigmentation à surveiller.",
      diameter: "Estimé autour de 6 mm.",
    },
    high: {
      asymmetry: "Asymétrie marquée détectée sur l'axe longitudinal.",
      border: "Bordures irrégulières et mal délimitées.",
      color: "Pigmentation hétérogène (nuances brun foncé et noir).",
      diameter: "Estimé supérieur à 6 mm.",
    },
  },
};

const RECOMMENDATIONS: Record<Lang, Record<RiskLevel, string>> = {
  en: {
    "Low Risk":
      "No urgent warning sign identified. Keep monitoring the lesion and show it to your doctor at your next visit. Consult a dermatologist promptly if it changes in size, shape or color.",
    "Moderate Risk":
      "A consultation with a dermatologist is recommended within 4 to 6 weeks to evaluate the lesion and decide whether dermoscopic monitoring or removal is appropriate.",
    "High Risk":
      "Urgent consultation with a dermatologist is strongly recommended within 1 to 2 weeks. Do not delay the appointment, and bring this report along.",
  },
  fr: {
    "Low Risk":
      "Aucun signe d'alerte urgent identifié. Continuez à surveiller la lésion et montrez-la à votre médecin lors de votre prochaine consultation. Consultez rapidement un dermatologue si elle change de taille, de forme ou de couleur.",
    "Moderate Risk":
      "Une consultation auprès d'un dermatologue est recommandée sous 4 à 6 semaines afin d'évaluer la lésion et de déterminer si une surveillance dermoscopique ou une exérèse est nécessaire.",
    "High Risk":
      "Une consultation urgente auprès d'un dermatologue est fortement recommandée sous 1 à 2 semaines. Ne reportez pas le rendez-vous et apportez ce rapport.",
  },
};

function buildRationale(
  clinicalData: ClinicalData,
  lang: Lang,
): string {
  const factors: string[] = [];
  if (clinicalData.symptoms.includes("bleeding")) {
    factors.push(lang === "fr" ? "saignements rapportés" : "reported bleeding");
  }
  if (clinicalData.symptoms.includes("size-color-change")) {
    factors.push(
      lang === "fr"
        ? "évolution récente de taille ou de couleur"
        : "recent change in size or color",
    );
  }
  if (clinicalData.symptoms.includes("itching")) {
    factors.push(lang === "fr" ? "démangeaisons" : "itching");
  }
  if (clinicalData.symptoms.includes("pain")) {
    factors.push(lang === "fr" ? "douleur locale" : "local pain");
  }
  if (clinicalData.familyHistory) {
    factors.push(
      lang === "fr"
        ? "antécédents personnels ou familiaux de cancer de la peau"
        : "personal or family history of skin cancer",
    );
  }
  factors.push(
    lang === "fr"
      ? `lésion localisée ${locationLabels.fr[clinicalData.lesionLocation].toLowerCase()} apparue il y a ${durationLabels.fr[clinicalData.duration].toLowerCase()}`
      : `lesion on the ${locationLabels.en[clinicalData.lesionLocation].toLowerCase()} for ${durationLabels.en[clinicalData.duration].toLowerCase()}`,
  );

  if (lang === "fr") {
    return `Mode démo : estimation déterministe fondée sur le profil clinique (${factors.join(", ")}). Les critères visuels sont déduits du profil clinique et non d'une véritable analyse d'image. Configurez OPENROUTER_API_KEY pour activer le moteur d'analyse visuelle.`;
  }
  return `Demo mode: deterministic estimate based on the clinical profile (${factors.join(", ")}). Visual criteria are inferred from the clinical profile, not from an actual image analysis. Configure OPENROUTER_API_KEY to enable the vision engine.`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface HeuristicParams {
  clinicalData: ClinicalData;
  imageBase64: string;
  lang: Lang;
}

export function analyzeHeuristically({
  clinicalData,
  imageBase64,
  lang,
}: HeuristicParams): AnalysisResult {
  // Hash a sample of the image so the demo varies per image but stays stable.
  const sample = imageBase64.slice(0, 2048) + imageBase64.slice(-2048);
  const imageSeed = hashString(sample);

  const riskScore = computeHeuristicScore(clinicalData, imageSeed);
  const riskLevel = levelFromScore(riskScore);
  const tier = tierFromScore(riskScore);

  return {
    riskScore,
    riskLevel,
    abcdeAssessment: ABCDE_TEMPLATES[lang][tier],
    clinicalRationale: buildRationale(clinicalData, lang),
    recommendation: RECOMMENDATIONS[lang][riskLevel],
  };
}
