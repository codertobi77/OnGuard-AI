"use client";

import { useI18n } from "@/lib/i18n";
import { riskLevelLabels } from "@/lib/labels";
import { RISK_COLORS, riskColor } from "@/lib/risk";
import type { RiskLevel } from "@/types";

/**
 * Semicircular SVG risk gauge (0–10).
 * Green arc 0–4, orange arc 4–7, red arc 7–10, needle marker at the score.
 */

const CX = 100;
const CY = 100;
const RADIUS = 80;
const STROKE_WIDTH = 14;

/** Map an angle in degrees (-90 = left end, 0 = top, 90 = right end) to a point. */
function polar(angle: number, radius = RADIUS) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polar(startAngle);
  const end = polar(endAngle);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const scoreToAngle = (score: number) =>
  -90 + (Math.min(Math.max(score, 0), 10) / 10) * 180;

function formatScore(score: number) {
  const rounded = Math.round(score * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const { lang, t } = useI18n();
  const color = riskColor(level);
  const levelLabel = riskLevelLabels[lang][level];

  const markerAngle = scoreToAngle(score);
  const markerInner = polar(markerAngle, RADIUS - STROKE_WIDTH / 2 - 3);
  const markerOuter = polar(markerAngle, RADIUS + STROKE_WIDTH / 2 + 3);

  return (
    <svg
      viewBox="0 0 200 118"
      role="img"
      aria-label={`${t("step4.score")}: ${formatScore(score)} / 10 — ${levelLabel}`}
      className="mx-auto h-auto w-full max-w-72"
    >
      {/* Green segment — scores 0 to 4 */}
      <path
        d={arcPath(-90, -18)}
        stroke={RISK_COLORS.low}
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      {/* Orange segment — scores 4 to 7 */}
      <path
        d={arcPath(-18, 36)}
        stroke={RISK_COLORS.moderate}
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      {/* Red segment — scores 7 to 10 */}
      <path
        d={arcPath(36, 90)}
        stroke={RISK_COLORS.high}
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />

      {/* Score needle */}
      <line
        x1={markerInner.x}
        y1={markerInner.y}
        x2={markerOuter.x}
        y2={markerOuter.y}
        stroke="#0f172a"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Score value + level label */}
      <text
        x={100}
        y={94}
        textAnchor="middle"
        fontSize={40}
        fontWeight={700}
        fill={color}
      >
        {formatScore(score)}
      </text>
      <text
        x={100}
        y={110}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={600}
        fill="#64748b"
      >
        {levelLabel}
      </text>

      {/* Scale ticks */}
      <text x={16} y={113} fontSize={8} fill="#94a3b8">
        0
      </text>
      <text x={178} y={113} fontSize={8} fill="#94a3b8">
        10
      </text>
    </svg>
  );
}
