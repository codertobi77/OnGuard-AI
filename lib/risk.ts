import type { RiskLevel } from "@/types";

/**
 * Risk-tier visual helpers shared by the wizard UI (gauge, badges, alerts).
 * Palette from the specification: green #22c55e, orange #f97316, red #ef4444.
 */

export const RISK_COLORS = {
  low: "#22c55e",
  moderate: "#f97316",
  high: "#ef4444",
} as const;

/** Hex color of the risk tier (gauge segments and score text). */
export function riskColor(level: RiskLevel): string {
  switch (level) {
    case "Low Risk":
      return RISK_COLORS.low;
    case "Moderate Risk":
      return RISK_COLORS.moderate;
    case "High Risk":
      return RISK_COLORS.high;
  }
}

/** Readable text color class for the given risk level. */
export function riskTextClass(level: RiskLevel): string {
  switch (level) {
    case "Low Risk":
      return "text-green-600";
    case "Moderate Risk":
      return "text-orange-600";
    case "High Risk":
      return "text-red-600";
  }
}

/** Badge styles (tinted background + border) for the given risk level. */
export function riskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case "Low Risk":
      return "border-green-500/30 bg-green-500/10 text-green-700";
    case "Moderate Risk":
      return "border-orange-500/30 bg-orange-500/10 text-orange-700";
    case "High Risk":
      return "border-red-500/30 bg-red-500/10 text-red-700";
  }
}

/** Thick colored left border for highlighted blocks (recommendation alert). */
export function riskAccentClass(level: RiskLevel): string {
  switch (level) {
    case "Low Risk":
      return "border-l-4 border-l-green-500";
    case "Moderate Risk":
      return "border-l-4 border-l-orange-500";
    case "High Risk":
      return "border-l-4 border-l-red-500";
  }
}
