"use client";

import { IconPhotoUp, IconX } from "@tabler/icons-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CUSTOM_LOGO_MAX_INPUT_BYTES,
  CUSTOM_LOGO_PNG_ACCEPT,
  readPngPreviewUrl,
} from "@/lib/custom-logo-png";
import { cn } from "@/lib/utils";

interface CustomLogoUploadFieldProps {
  featured?: boolean;
  onError: (message: string | null) => void;
  onFileChange: (file: File | null) => void;
}

export function CustomLogoUploadField({
  featured = false,
  onFileChange,
  onError,
}: CustomLogoUploadFieldProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  const clearLogo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setLogoFile(null);
    setPreviewUrl(null);
    onFileChange(null);
    onError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectLogo = (file: File) => {
    if (file.type !== CUSTOM_LOGO_PNG_ACCEPT) {
      onError("Upload a PNG with a transparent background.");
      return;
    }

    if (file.size > CUSTOM_LOGO_MAX_INPUT_BYTES) {
      onError("PNG must be 2 MB or smaller.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setLogoFile(file);
    setPreviewUrl(readPngPreviewUrl(file));
    onFileChange(file);
    onError(null);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={fileInputId}>Logo PNG</Label>
      <input
        accept={CUSTOM_LOGO_PNG_ACCEPT}
        className="sr-only"
        id={fileInputId}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            selectLogo(file);
          }
        }}
        ref={fileInputRef}
        type="file"
      />

      {previewUrl ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border bg-background p-3",
            featured && "border-foreground/15"
          )}
        >
          <div className="flex h-12 w-28 items-center justify-center rounded-md bg-muted/50 px-2">
            {/* biome-ignore lint/performance/noImgElement: local object URL preview */}
            <img
              alt=""
              className="max-h-10 max-w-full object-contain"
              height={40}
              src={previewUrl}
              width={112}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{logoFile?.name}</p>
            <p className="text-muted-foreground text-xs">
              Transparent PNG · 2 MB max
            </p>
          </div>
          <Button
            aria-label="Remove logo"
            onClick={clearLogo}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <IconX stroke={2} />
          </Button>
        </div>
      ) : (
        <button
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors hover:bg-muted/40",
            featured
              ? "border-foreground/25 bg-background"
              : "border-border bg-background/60"
          )}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <IconPhotoUp className="size-5 text-muted-foreground" stroke={1.75} />
          <span className="font-medium text-sm">Choose PNG</span>
          <span className="text-muted-foreground text-xs">
            Transparent background works best
          </span>
        </button>
      )}
    </div>
  );
}

export function useCustomLogoUploadReset() {
  const [resetKey, setResetKey] = useState(0);

  return {
    resetKey,
    resetUpload: () => setResetKey((current) => current + 1),
  };
}
