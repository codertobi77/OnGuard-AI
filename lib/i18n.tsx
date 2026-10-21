"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Lang } from "@/types";

/**
 * Lightweight bilingual i18n (EN/FR) with a typed dictionary.
 * The active language is kept in React context and persisted to localStorage.
 */

const en = {
  // Common
  "common.back": "Back",
  "common.next": "Continue",
  "common.yes": "Yes",
  "common.no": "No",
  "common.retry": "Try again",
  "common.loading": "Loading…",
  "common.showMore": "Show more",
  "common.showLess": "Show less",

  // Navigation
  "nav.home": "Home",
  "nav.assess": "Assessment",
  "nav.dashboard": "Dashboard",

  // Medical disclaimer
  "disclaimer.title": "Medical Disclaimer",
  "disclaimer.dismiss": "Dismiss notice",
  "disclaimer.dismissed": "Notice dismissed.",
  "disclaimer.text":
    "OnGuard AI is a pre-diagnostic support tool intended to assist healthcare professionals. It does not replace a medical opinion, diagnosis, or consultation with a qualified dermatologist. Always seek professional medical advice for any skin concern.",

  // Footer
  "footer.tagline": "Multimodal AI for early skin cancer risk stratification.",
  "footer.builtFor": "Built by LiteTECH Startup for the 2026 Intl CodeTheCure Hackathon.",
  "footer.privacy": "Anonymized data only — no personally identifiable information is stored.",

  // Landing
  "landing.badge": "2026 Intl CodeTheCure Hackathon — Detection & Diagnosis",
  "landing.title": "Multimodal AI Platform for Early Skin Cancer Risk Stratification",
  "landing.subtitle":
    "OnGuard AI combines dermoscopic image analysis with clinical reasoning to help detect melanoma and skin lesions early, delivering a structured risk report in minutes.",
  "landing.cta": "Start Assessment",
  "landing.ctaSecondary": "View Dashboard",
  "landing.stepsTitle": "A guided clinical journey in 4 steps",
  "landing.stepsSubtitle":
    "From clinical profile to a stratified risk report — a structured workflow inspired by dermatology best practices.",
  "landing.step1.title": "Clinical Profile",
  "landing.step1.desc": "Lesion location, duration, symptoms and family history — anonymized.",
  "landing.step2.title": "Image Upload",
  "landing.step2.desc": "Drag & drop a dermoscopic photo (JPEG/PNG, up to 10 MB).",
  "landing.step3.title": "Multimodal Analysis",
  "landing.step3.desc": "Vision-language AI cross-references the image with the clinical data in real time.",
  "landing.step4.title": "Risk Report",
  "landing.step4.desc": "Unified 0–10 risk score, ABCDE breakdown and a clear care recommendation.",
  "landing.featuresTitle": "Why OnGuard AI",
  "landing.feature1.title": "Multimodal reasoning",
  "landing.feature1.desc": "A vision-language model analyzes the lesion image and merges it with the patient's clinical context.",
  "landing.feature2.title": "Privacy by design",
  "landing.feature2.desc": "No names, no identifiers — only anonymized clinical data is ever persisted.",
  "landing.feature3.title": "ABCDE framework",
  "landing.feature3.desc": "Assessments follow the dermatology ABCDE criteria: Asymmetry, Border, Color, Diameter, Evolution.",
  "landing.ethicsTitle": "Ethics & responsibility",
  "landing.ethicsText":
    "OnGuard AI is a decision-support tool, not a diagnostic device. Our commitment: transparent AI outputs, anonymized data, and clear recommendations to consult a dermatologist. The final medical decision always belongs to a healthcare professional.",

  // Assessment wizard
  "assess.title": "Guided Skin Lesion Assessment",
  "assess.subtitle": "Complete the 4 steps to obtain a stratified risk report.",
  "assess.step1": "Profile",
  "assess.step2": "Image",
  "assess.step3": "Analysis",
  "assess.step4": "Report",

  // Step 1 — Clinical profile
  "step1.title": "Clinical Profile",
  "step1.desc": "Provide the anonymized clinical context of the lesion.",
  "step1.location": "Lesion location",
  "step1.locationPlaceholder": "Select a body area",
  "step1.duration": "Appearance duration",
  "step1.symptoms": "Associated symptoms",
  "step1.symptomsHint": "Select all that apply.",
  "step1.familyHistory": "Personal or family history of skin cancer",

  // Step 2 — Image upload
  "step2.title": "Dermoscopic Image",
  "step2.desc": "Upload a clear, well-lit photo of the lesion.",
  "step2.dropTitle": "Drag & drop your image here",
  "step2.dropHint": "or click to browse — JPEG or PNG, max 10 MB",
  "step2.preview": "Image preview",
  "step2.replace": "Replace",
  "step2.remove": "Remove",
  "step2.error.type": "Unsupported format. Please use a JPEG or PNG image.",
  "step2.error.size": "Image too large. Maximum size is 10 MB.",
  "step2.error.read": "Could not read the image file. Please try another file.",
  "step2.zoomHint": "Open the image viewer",
  "step2.removed": "Removed",

  // Step 3 — Analysis
  "step3.title": "Multimodal Analysis",
  "step3.desc": "OnGuard AI is analyzing your data. This may take up to a minute.",
  "step3.msg1": "Analyzing visual features…",
  "step3.msg2": "Cross-referencing clinical data…",
  "step3.msg3": "Computing risk stratification…",
  "step3.error": "The analysis could not be completed. Please try again.",
  "step3.progress": "Analysis progress",

  // Step 4 — Report
  "step4.title": "Risk Stratification Report",
  "step4.score": "Unified Risk Score",
  "step4.scoreHint": "Scale from 0 (lowest) to 10 (highest)",
  "step4.visualTitle": "Visual Analysis — ABCDE Criteria",
  "step4.asymmetry": "Asymmetry",
  "step4.border": "Border",
  "step4.color": "Color",
  "step4.diameter": "Diameter",
  "step4.clinicalTitle": "Clinical Analysis",
  "step4.clinicalHint": "Aggravating clinical factors identified from your profile.",
  "step4.rationaleTitle": "Clinical rationale",
  "step4.recommendationTitle": "Clinical recommendation",
  "step4.downloadPdf": "Download PDF Report",
  "step4.downloadJson": "Download JSON",
  "step4.downloadError": "The report download failed. Please try again.",
  "step4.newAssessment": "Start New Assessment",
  "step4.viewDashboard": "View Dashboard",
  "step4.demoBadge": "Demo mode — heuristic engine",
  "step4.engineLabel": "Engine",
  "step4.engineOpenrouter": "Vision LLM via OpenRouter",
  "step4.engineHeuristic": "Built-in heuristic engine (demo)",
  "step4.saved": "Assessment saved to database",
  "step4.notSaved": "Not saved — database unavailable",
  "step4.idLabel": "Assessment ID",
  "step4.copyId": "Copy ID",
  "step4.copyIdCopied": "Copied",
  "step4.copyIdFailed": "Failed",
  "step4.copyIdHint": "Copy the assessment ID",
  "step4.generating": "Generating…",
  "step4.downloaded": "Downloaded",
  "step4.downloadFailed": "Failed — retry",
  "step4.resetDone": "Assessment cleared",

  // Dashboard
  "dashboard.title": "Results Dashboard",
  "dashboard.subtitle": "History of anonymized assessments processed by OnGuard AI.",
  "dashboard.total": "Total assessments",
  "dashboard.avgScore": "Average risk score",
  "dashboard.highRisk": "High-risk cases",
  "dashboard.empty": "No assessments recorded yet. Complete an assessment to populate the dashboard.",
  "dashboard.dbUnavailable":
    "The database is not configured yet. Set DATABASE_URL in .env.local, then create the onguard_db database and run the Prisma schema push.",
  "dashboard.date": "Date",
  "dashboard.location": "Location",
  "dashboard.score": "Score",
  "dashboard.level": "Risk level",
  "dashboard.symptoms": "Symptoms",
  "dashboard.familyHistory": "Family history",
  "dashboard.noSymptoms": "None reported",
  "dashboard.viewCta": "Start an assessment",
  "dashboard.filterLabel": "Filter by risk level",
  "dashboard.filterAll": "All",
  "dashboard.filterHigh": "High risk",
  "dashboard.tableLabel": "Assessment history",

  // Language toggle
  "lang.toggle": "Change language",
} as const;

export type MessageKey = keyof typeof en;

const fr: Record<MessageKey, string> = {
  // Common
  "common.back": "Retour",
  "common.next": "Continuer",
  "common.yes": "Oui",
  "common.no": "Non",
  "common.retry": "Réessayer",
  "common.loading": "Chargement…",
  "common.showMore": "Afficher plus",
  "common.showLess": "Réduire",

  // Navigation
  "nav.home": "Accueil",
  "nav.assess": "Évaluation",
  "nav.dashboard": "Tableau de bord",

  // Medical disclaimer
  "disclaimer.title": "Avertissement médical",
  "disclaimer.dismiss": "Fermer l'avertissement",
  "disclaimer.dismissed": "Avertissement fermé.",
  "disclaimer.text":
    "OnGuard AI est un outil d'aide au pré-diagnostic destiné à assister les professionnels de santé. Il ne remplace en aucun cas un avis médical, un diagnostic ou une consultation auprès d'un dermatologue qualifié. Consultez toujours un professionnel de santé pour toute anomalie cutanée.",

  // Footer
  "footer.tagline": "IA multimodale pour la stratification précoce du risque de cancer de la peau.",
  "footer.builtFor": "Réalisé par LiteTECH Startup pour le hackathon Intl CodeTheCure 2026.",
  "footer.privacy": "Données anonymisées uniquement — aucune information nominative n'est stockée.",

  // Landing
  "landing.badge": "Hackathon Intl CodeTheCure 2026 — Détection & Diagnostic",
  "landing.title": "Plateforme IA multimodale de stratification précoce du risque de cancer de la peau",
  "landing.subtitle":
    "OnGuard AI combine l'analyse d'images dermoscopiques et le raisonnement clinique pour détecter précocement les mélanomes et lésions cutanées, et produire un rapport de risque structuré en quelques minutes.",
  "landing.cta": "Commencer l'évaluation",
  "landing.ctaSecondary": "Voir le tableau de bord",
  "landing.stepsTitle": "Un parcours clinique guidé en 4 étapes",
  "landing.stepsSubtitle":
    "Du profil clinique au rapport de risque stratifié — un workflow structuré inspiré des bonnes pratiques dermatologiques.",
  "landing.step1.title": "Profil clinique",
  "landing.step1.desc": "Localisation, durée, symptômes et antécédents — entièrement anonymisés.",
  "landing.step2.title": "Import d'image",
  "landing.step2.desc": "Glissez-déposez une photo dermoscopique (JPEG/PNG, 10 Mo max).",
  "landing.step3.title": "Analyse multimodale",
  "landing.step3.desc": "L'IA vision-langage croise l'image et les données cliniques en temps réel.",
  "landing.step4.title": "Rapport de risque",
  "landing.step4.desc": "Score unifié 0–10, décomposition ABCDE et recommandation de prise en charge claire.",
  "landing.featuresTitle": "Pourquoi OnGuard AI",
  "landing.feature1.title": "Raisonnement multimodal",
  "landing.feature1.desc": "Un modèle vision-langage analyse l'image de la lésion et la fusionne avec le contexte clinique.",
  "landing.feature2.title": "Confidentialité par conception",
  "landing.feature2.desc": "Aucun nom, aucun identifiant — seules des données cliniques anonymisées sont persistées.",
  "landing.feature3.title": "Cadre ABCDE",
  "landing.feature3.desc": "Les évaluations suivent les critères dermatologiques ABCDE : Asymétrie, Bordures, Couleur, Diamètre, Évolution.",
  "landing.ethicsTitle": "Éthique & responsabilité",
  "landing.ethicsText":
    "OnGuard AI est un outil d'aide à la décision, pas un dispositif de diagnostic. Notre engagement : des sorties IA transparentes, des données anonymisées et des recommandations claires de consultation dermatologique. La décision médicale finale appartient toujours à un professionnel de santé.",

  // Assessment wizard
  "assess.title": "Évaluation guidée de lésion cutanée",
  "assess.subtitle": "Complétez les 4 étapes pour obtenir un rapport de risque stratifié.",
  "assess.step1": "Profil",
  "assess.step2": "Image",
  "assess.step3": "Analyse",
  "assess.step4": "Rapport",

  // Step 1 — Clinical profile
  "step1.title": "Profil clinique",
  "step1.desc": "Renseignez le contexte clinique anonymisé de la lésion.",
  "step1.location": "Localisation de la lésion",
  "step1.locationPlaceholder": "Sélectionnez une zone du corps",
  "step1.duration": "Durée d'apparition",
  "step1.symptoms": "Symptômes associés",
  "step1.symptomsHint": "Sélectionnez tous les symptômes pertinents.",
  "step1.familyHistory": "Antécédents personnels ou familiaux de cancer de la peau",

  // Step 2 — Image upload
  "step2.title": "Image dermoscopique",
  "step2.desc": "Importez une photo nette et bien éclairée de la lésion.",
  "step2.dropTitle": "Glissez-déposez votre image ici",
  "step2.dropHint": "ou cliquez pour parcourir — JPEG ou PNG, 10 Mo max",
  "step2.preview": "Aperçu de l'image",
  "step2.replace": "Remplacer",
  "step2.remove": "Supprimer",
  "step2.error.type": "Format non pris en charge. Utilisez une image JPEG ou PNG.",
  "step2.error.size": "Image trop volumineuse. Taille maximale : 10 Mo.",
  "step2.error.read": "Impossible de lire le fichier image. Réessayez avec un autre fichier.",
  "step2.zoomHint": "Ouvrir la visionneuse",
  "step2.removed": "Image supprimée",

  // Step 3 — Analysis
  "step3.title": "Analyse multimodale",
  "step3.desc": "OnGuard AI analyse vos données. Cela peut prendre jusqu'à une minute.",
  "step3.msg1": "Analyse des caractéristiques visuelles…",
  "step3.msg2": "Croisement avec les données cliniques…",
  "step3.msg3": "Calcul de la stratification du risque…",
  "step3.error": "L'analyse n'a pas pu être menée à terme. Veuillez réessayer.",
  "step3.progress": "Progression de l'analyse",

  // Step 4 — Report
  "step4.title": "Rapport de stratification du risque",
  "step4.score": "Score de risque unifié",
  "step4.scoreHint": "Échelle de 0 (le plus faible) à 10 (le plus élevé)",
  "step4.visualTitle": "Analyse visuelle — Critères ABCDE",
  "step4.asymmetry": "Asymétrie",
  "step4.border": "Bordures",
  "step4.color": "Couleur",
  "step4.diameter": "Diamètre",
  "step4.clinicalTitle": "Analyse clinique",
  "step4.clinicalHint": "Facteurs cliniques aggravants identifiés à partir de votre profil.",
  "step4.rationaleTitle": "Justification clinique",
  "step4.recommendationTitle": "Recommandation clinique",
  "step4.downloadPdf": "Télécharger le rapport PDF",
  "step4.downloadJson": "Télécharger le JSON",
  "step4.downloadError": "Le téléchargement du rapport a échoué. Veuillez réessayer.",
  "step4.newAssessment": "Nouvelle évaluation",
  "step4.viewDashboard": "Voir le tableau de bord",
  "step4.demoBadge": "Mode démo — moteur heuristique",
  "step4.engineLabel": "Moteur",
  "step4.engineOpenrouter": "LLM vision via OpenRouter",
  "step4.engineHeuristic": "Moteur heuristique intégré (démo)",
  "step4.saved": "Évaluation enregistrée en base",
  "step4.notSaved": "Non enregistré — base de données indisponible",
  "step4.idLabel": "Identifiant d'évaluation",
  "step4.copyId": "Copier l'ID",
  "step4.copyIdCopied": "Copié",
  "step4.copyIdFailed": "Échec",
  "step4.copyIdHint": "Copier l'identifiant de l'évaluation",
  "step4.generating": "Génération…",
  "step4.downloaded": "Téléchargé",
  "step4.downloadFailed": "Échec — réessayer",
  "step4.resetDone": "Évaluation réinitialisée",

  // Dashboard
  "dashboard.title": "Tableau de bord des résultats",
  "dashboard.subtitle": "Historique des évaluations anonymisées traitées par OnGuard AI.",
  "dashboard.total": "Évaluations totales",
  "dashboard.avgScore": "Score de risque moyen",
  "dashboard.highRisk": "Cas à risque élevé",
  "dashboard.empty": "Aucune évaluation enregistrée pour l'instant. Terminez une évaluation pour alimenter le tableau de bord.",
  "dashboard.dbUnavailable":
    "La base de données n'est pas encore configurée. Renseignez DATABASE_URL dans .env.local, puis créez la base onguard_db et poussez le schéma Prisma.",
  "dashboard.date": "Date",
  "dashboard.location": "Localisation",
  "dashboard.score": "Score",
  "dashboard.level": "Niveau de risque",
  "dashboard.symptoms": "Symptômes",
  "dashboard.familyHistory": "Antécédents familiaux",
  "dashboard.noSymptoms": "Aucun signalé",
  "dashboard.viewCta": "Démarrer une évaluation",
  "dashboard.filterLabel": "Filtrer par niveau de risque",
  "dashboard.filterAll": "Toutes",
  "dashboard.filterHigh": "Risque élevé",
  "dashboard.tableLabel": "Historique des évaluations",

  // Language toggle
  "lang.toggle": "Changer de langue",
};

const dictionaries: Record<Lang, Record<MessageKey, string>> = {
  en,
  fr,
};

const STORAGE_KEY = "onguard-lang";
const SERVER_LANG: Lang = "en";

type Listener = () => void;
const listeners = new Set<Listener>();

/** Current language, lazily seeded from localStorage (client only). */
let currentLang: Lang | null = null;

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "fr" ? stored : SERVER_LANG;
  } catch {
    // localStorage unavailable — keep default language.
    return SERVER_LANG;
  }
}

function getSnapshot(): Lang {
  if (currentLang === null) currentLang = readStoredLang();
  return currentLang;
}

function getServerSnapshot(): Lang {
  return SERVER_LANG;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  // Sync the document language once the client has mounted.
  document.documentElement.lang = getSnapshot();
  // Keep tabs in sync when the language is changed elsewhere.
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === STORAGE_KEY &&
      (event.newValue === "en" || event.newValue === "fr")
    ) {
      currentLang = event.newValue;
      document.documentElement.lang = event.newValue;
      for (const notify of listeners) notify();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setStoredLang(lang: Lang) {
  currentLang = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore persistence failures.
  }
  document.documentElement.lang = lang;
  for (const notify of listeners) notify();
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const t = useCallback((key: MessageKey) => dictionaries[lang][key], [lang]);

  const value = useMemo(
    () => ({ lang, setLang: setStoredLang, t }),
    [lang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <LanguageProvider>");
  }
  return ctx;
}
