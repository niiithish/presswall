"use client";

import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import {
  CustomLogoUploadField,
  useCustomLogoUploadReset,
} from "@/components/presswall/custom-logo-upload-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomLogoPngError, pngFileToLogoSvg } from "@/lib/custom-logo-png";
import { LOGO_GUIDANCE } from "@/lib/logo-guidance";

interface CustomOutletFormProps {
  compact?: boolean;
  featured?: boolean;
  onAdd: (name: string, svg: string) => void;
}

export function CustomOutletForm({
  onAdd,
  compact = false,
  featured = false,
}: CustomOutletFormProps) {
  const { resetKey, resetUpload } = useCustomLogoUploadReset();
  const [customName, setCustomName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!(customName.trim() && logoFile)) {
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const svg = await pngFileToLogoSvg(logoFile);
      onAdd(customName.trim(), svg);
      setCustomName("");
      setLogoFile(null);
      resetUpload();
    } catch (caught) {
      setError(
        caught instanceof CustomLogoPngError
          ? caught.message
          : "Could not add that logo. Try another PNG."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const uploadField = (
    <CustomLogoUploadField
      featured={featured}
      key={resetKey}
      onError={setError}
      onFileChange={setLogoFile}
    />
  );

  let buttonSize: "default" | "lg" | "sm" = "default";
  if (featured) {
    buttonSize = "lg";
  } else if (compact) {
    buttonSize = "sm";
  }

  let buttonLabel = "Add custom outlet";
  if (isAdding) {
    buttonLabel = "Adding...";
  } else if (compact) {
    buttonLabel = "Add outlet";
  }

  const addButton = (
    <Button
      className={featured ? "h-10 w-full" : undefined}
      disabled={!(customName.trim() && logoFile) || isAdding}
      onClick={() => {
        handleAdd().catch(() => undefined);
      }}
      size={buttonSize}
      variant={compact ? "default" : "outline"}
    >
      <IconPlus stroke={2} />
      {buttonLabel}
    </Button>
  );

  if (compact) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="custom-name">Outlet name</Label>
            <Input
              className={featured ? "h-10 bg-background" : undefined}
              id="custom-name"
              onChange={(event) => setCustomName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAdd().catch(() => undefined);
                }
              }}
              placeholder="Podcast, local news, blog..."
              value={customName}
            />
          </div>

          {uploadField}

          {error ? <p className="text-destructive text-xs">{error}</p> : null}

          {addButton}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <AlertTitle>{LOGO_GUIDANCE.title}</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{LOGO_GUIDANCE.summary}</p>
          <ul className="list-disc space-y-1 pl-4">
            {LOGO_GUIDANCE.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid gap-3">
        <Label htmlFor="custom-name">Custom outlet name</Label>
        <Input
          id="custom-name"
          onChange={(event) => setCustomName(event.target.value)}
          placeholder="Podcast, local news, blog..."
          value={customName}
        />

        {uploadField}

        {error ? <p className="text-destructive text-xs">{error}</p> : null}

        {addButton}
      </div>
    </div>
  );
}
