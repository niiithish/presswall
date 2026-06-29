"use client";

import {
  IconCircleCheck,
  IconDeviceDesktop,
  IconDeviceMobile,
} from "@tabler/icons-react";
import { useState } from "react";
import { OnboardingActions } from "@/components/presswall/onboarding-actions";
import { OnboardingPreview } from "@/components/presswall/onboarding-preview";
import { OnboardingPreviewCanvas } from "@/components/presswall/onboarding-preview-canvas";
import { OnboardingTemplateCustomControls } from "@/components/presswall/onboarding-template-custom-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PresswallEditor } from "@/hooks/use-presswall-editor";
import {
  applyPresswallTemplate,
  getConfigPreviewTheme,
  getTemplatePreviewTheme,
  PRESSWALL_TEMPLATES,
  type PresswallTemplate,
} from "@/lib/presswall-templates";
import { cn } from "@/lib/utils";

interface OnboardingTemplateStepProps {
  editor: PresswallEditor;
  onBack: () => void;
  onNext: () => void;
}

type DeviceMode = "desktop" | "mobile";

function templateLayoutLabel(template: PresswallTemplate): string {
  if (template.config.layout === "marquee") {
    return "Scroll";
  }
  if (template.config.layout === "grid") {
    return "Grid";
  }
  return "Bar";
}

function DeviceToggle({
  mode,
  onChange,
}: {
  mode: DeviceMode;
  onChange: (mode: DeviceMode) => void;
}) {
  return (
    <fieldset className="inline-flex rounded-lg border bg-background p-0.5">
      <Button
        aria-pressed={mode === "desktop"}
        className="h-7 gap-1.5 px-2.5 text-xs"
        onClick={() => onChange("desktop")}
        size="sm"
        type="button"
        variant={mode === "desktop" ? "secondary" : "ghost"}
      >
        <IconDeviceDesktop className="size-3.5" stroke={2} />
        Desktop
      </Button>
      <Button
        aria-pressed={mode === "mobile"}
        className="h-7 gap-1.5 px-2.5 text-xs"
        onClick={() => onChange("mobile")}
        size="sm"
        type="button"
        variant={mode === "mobile" ? "secondary" : "ghost"}
      >
        <IconDeviceMobile className="size-3.5" stroke={2} />
        Mobile
      </Button>
    </fieldset>
  );
}

function TemplateRow({
  catalog,
  editor,
  isSelected,
  selections,
  template,
}: {
  catalog: PresswallEditor["catalog"];
  editor: PresswallEditor;
  isSelected: boolean;
  selections: PresswallEditor["selections"];
  template: PresswallTemplate;
}) {
  const previewConfig = applyPresswallTemplate(template.id);

  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-lg border p-2.5 text-left transition-all",
        isSelected
          ? "border-foreground/50 bg-muted/50 ring-1 ring-foreground/25"
          : "hover:border-foreground/20 hover:bg-muted/30"
      )}
      onClick={() => editor.applyTemplate(template.id)}
      type="button"
    >
      <div className="relative w-full">
        <OnboardingPreview
          catalog={catalog}
          className="pointer-events-none w-full border-black/5 shadow-none"
          config={previewConfig}
          previewTheme={getTemplatePreviewTheme(template.id)}
          scale="sm"
          selections={selections}
        />

        {isSelected ? (
          <span className="absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
            <IconCircleCheck className="size-3.5" stroke={2.5} />
          </span>
        ) : null}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-sm">{template.name}</p>
          <Badge className="shrink-0 text-[0.625rem]" variant="secondary">
            {templateLayoutLabel(template)}
          </Badge>
        </div>
        <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {template.description}
        </p>
      </div>
    </button>
  );
}

export function OnboardingTemplateStep({
  editor,
  onBack,
  onNext,
}: OnboardingTemplateStepProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "custom">(
    "templates"
  );
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const previewTheme = getConfigPreviewTheme(editor.config);

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-3">
      <p className="shrink-0 text-muted-foreground text-xs">
        Step 2 of 3 — Design your press strip
      </p>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-h-0 min-w-0 flex-[3] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
            <p className="font-medium text-sm">Live preview</p>
            <DeviceToggle mode={deviceMode} onChange={setDeviceMode} />
          </div>

          <div className="min-h-0 flex-1">
            <OnboardingPreviewCanvas
              catalog={editor.catalog}
              config={editor.config}
              deviceMode={deviceMode}
              previewTheme={previewTheme}
              selections={editor.selections}
            />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-[2] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <Tabs
            className="flex min-h-0 flex-1 flex-col"
            onValueChange={(value) =>
              setActiveTab(value as "templates" | "custom")
            }
            value={activeTab}
          >
            <div className="shrink-0 border-b px-3 pt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
              value="templates"
            >
              <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-2 p-3">
                  {PRESSWALL_TEMPLATES.map((template) => (
                    <TemplateRow
                      catalog={editor.catalog}
                      editor={editor}
                      isSelected={editor.matchedTemplateId === template.id}
                      key={template.id}
                      selections={editor.selections}
                      template={template}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
              value="custom"
            >
              <OnboardingTemplateCustomControls
                config={editor.config}
                onUpdate={editor.updateConfig}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <OnboardingActions
        className="shrink-0 pt-2 pb-6"
        compact
        nextLabel="Next"
        onBack={onBack}
        onNext={onNext}
        showBack
      />
    </div>
  );
}
