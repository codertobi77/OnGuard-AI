"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  ClipboardList,
  FileText,
  ImageUp,
  ListChecks,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MedicalDisclaimer } from "@/components/shared/medical-disclaimer";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { icon: ClipboardList, titleKey: "landing.step1.title", descKey: "landing.step1.desc" },
  { icon: ImageUp, titleKey: "landing.step2.title", descKey: "landing.step2.desc" },
  { icon: BrainCircuit, titleKey: "landing.step3.title", descKey: "landing.step3.desc" },
  { icon: FileText, titleKey: "landing.step4.title", descKey: "landing.step4.desc" },
] as const;

const FEATURES = [
  { icon: BrainCircuit, titleKey: "landing.feature1.title", descKey: "landing.feature1.desc" },
  { icon: Lock, titleKey: "landing.feature2.title", descKey: "landing.feature2.desc" },
  { icon: ListChecks, titleKey: "landing.feature3.title", descKey: "landing.feature3.desc" },
] as const;

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.28),transparent_65%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge
            variant="outline"
            className="border-teal-400/30 bg-teal-400/10 text-teal-200"
          >
            <Award aria-hidden="true" />
            {t("landing.badge")}
          </Badge>
          <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("landing.title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base text-slate-300 sm:text-lg">
            {t("landing.subtitle")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/assess">
                {t("landing.cta")}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/dashboard">{t("landing.ctaSecondary")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4-step journey */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("landing.stepsTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          {t("landing.stepsSubtitle")}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.titleKey} className="text-left">
                <CardContent className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-heading text-2xl font-semibold text-muted-foreground/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-medium">{t(step.titleKey)}</h3>
                  <p className="text-sm leading-snug text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("landing.featuresTitle")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.titleKey} className="text-left">
                <CardContent className="grid gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-medium">{t(feature.titleKey)}</h3>
                  <p className="text-sm leading-snug text-muted-foreground">
                    {t(feature.descKey)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Ethics band + medical disclaimer */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(13,148,136,0.25),transparent_60%)]" />
          <div className="relative grid gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                {t("landing.ethicsTitle")}
              </h2>
            </div>
            <p className="max-w-3xl text-pretty text-sm leading-relaxed text-slate-300">
              {t("landing.ethicsText")}
            </p>
            <MedicalDisclaimer className="max-w-3xl" />
          </div>
        </div>
      </section>
    </>
  );
}
