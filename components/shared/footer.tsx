"use client";

import { ShieldCheck, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <ShieldCheck className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold text-white">
                OnGuard AI
              </p>
              <p className="text-xs text-slate-400">{t("footer.tagline")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="size-3.5 text-teal-400" aria-hidden="true" />
            {t("footer.privacy")}
          </div>
        </div>
        <Separator className="my-5 bg-slate-700/60" />
        <p className="text-center text-xs text-slate-500">
          © 2026 LiteTECH Startup — {t("footer.builtFor")}
        </p>
      </div>
    </footer>
  );
}
