"use client";

import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LOGO_GUIDANCE } from "@/lib/logo-guidance";

interface CustomOutletFormProps {
  onAdd: (name: string, svg: string) => void;
}

export function CustomOutletForm({ onAdd }: CustomOutletFormProps) {
  const [customName, setCustomName] = useState("");
  const [customSvg, setCustomSvg] = useState("");

  const handleAdd = () => {
    if (!customName.trim()) {
      return;
    }
    onAdd(customName.trim(), customSvg.trim());
    setCustomName("");
    setCustomSvg("");
  };

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
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAdd();
            }
          }}
          placeholder="Podcast, local news, blog..."
          value={customName}
        />
        <div className="grid gap-2">
          <Label htmlFor="custom-svg">Logo (SVG recommended)</Label>
          <Textarea
            id="custom-svg"
            onChange={(event) => setCustomSvg(event.target.value)}
            placeholder='Paste inline SVG with a transparent background, e.g. <svg xmlns="http://www.w3.org/2000/svg" ...>'
            rows={4}
            value={customSvg}
          />
          <p className="text-muted-foreground text-xs">
            Transparent PNGs can be embedded as a base64{" "}
            <code className="rounded bg-muted px-1">&lt;image&gt;</code> inside
            an SVG if needed.
          </p>
        </div>
        <Button
          disabled={!customName.trim()}
          onClick={handleAdd}
          variant="outline"
        >
          <IconPlus stroke={2} />
          Add custom outlet
        </Button>
      </div>
    </div>
  );
}
