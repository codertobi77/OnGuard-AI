"use client";

import { useRef, useState } from "react";
import { ArrowRight, ImageUp, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { HoldToConfirm } from "@/components/interior/hold-to-confirm";
import { Lightbox } from "@/components/interior/lightbox";
import { useAssessmentStore } from "@/store/assessment";
import { MAX_IMAGE_BYTES } from "@/types";

/**
 * Images are downscaled client-side to keep payloads light (max dimension
 * below 1568px) and re-encoded as JPEG (PNG transparency flattened on white).
 */
const MAX_DIMENSION = 1568;

interface Step2ImageUploadProps {
  onNext: () => void;
  onBack?: () => void;
}

export function Step2ImageUpload({ onNext, onBack }: Step2ImageUploadProps) {
  const imageDataUrl = useAssessmentStore((state) => state.imageDataUrl);
  const setImage = useAssessmentStore((state) => state.setImage);
  const clearImage = useAssessmentStore((state) => state.clearImage);
  const { t } = useI18n();

  const inputRef = useRef<HTMLInputElement>(null);
  const figureRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const processFile = (file: File) => {
    setError(null);
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError(t("step2.error.type"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("step2.error.size"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError(t("step2.error.read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => setError(t("step2.error.read"));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          setError(t("step2.error.read"));
          return;
        }
        // Flatten PNG transparency onto white before re-encoding as JPEG.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);
        setImage(canvas.toDataURL("image/jpeg", 0.85), "image/jpeg");
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
    event.target.value = "";
  };

  const handleRemove = () => {
    clearImage();
    setError(null);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t("step2.title")}</CardTitle>
        <CardDescription>{t("step2.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) processFile(file);
          }}
          className="grid gap-2"
        >
          {imageDataUrl ? (
            <div className="grid gap-3">
              <figure
                ref={figureRef}
                className={cn(
                  "overflow-hidden rounded-xl border bg-muted/40 p-2",
                  isDragging && "border-primary ring-2 ring-primary/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={t("step2.zoomHint")}
                  className="mx-auto block w-full cursor-zoom-in rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local user-provided preview, not a remote asset */}
                  <img
                    src={imageDataUrl}
                    alt={t("step2.preview")}
                    className="mx-auto h-auto max-h-96 w-auto max-w-full rounded-lg object-contain"
                  />
                </button>
              </figure>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                >
                  <RefreshCw data-icon="inline-start" aria-hidden="true" />
                  {t("step2.replace")}
                </Button>
                <HoldToConfirm
                  tone="destructive"
                  duration={1500}
                  onConfirm={handleRemove}
                  confirmLabel={t("step2.removed")}
                >
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="size-4" aria-hidden="true" />
                    {t("step2.remove")}
                  </span>
                </HoldToConfirm>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                isDragging
                  ? "border-primary bg-accent"
                  : "border-input hover:border-primary/50 hover:bg-accent/40",
              )}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
                <ImageUp className="size-7" aria-hidden="true" />
              </span>
              <span className="font-medium">{t("step2.dropTitle")}</span>
              <span className="text-sm text-muted-foreground">
                {t("step2.dropHint")}
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              {t("common.back")}
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={onNext} disabled={!imageDataUrl}>
            {t("common.next")}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        {imageDataUrl && (
          <Lightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            src={imageDataUrl}
            alt={t("step2.preview")}
            originRef={figureRef}
            caption={t("step2.preview")}
          />
        )}
      </CardContent>
    </Card>
  );
}
