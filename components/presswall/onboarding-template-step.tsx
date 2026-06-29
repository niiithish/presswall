"use client";

import { IconCircleCheck } from "@tabler/icons-react";
import { OnboardingActions } from "@/components/presswall/onboarding-actions";
import { OnboardingPreview } from "@/components/presswall/onboarding-preview";
import { Badge } from "@/components/ui/badge";
import type { PresswallEditor } from "@/hooks/use-presswall-editor";
import {
  applyPresswallTemplate,
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

function templateLayoutLabel(template: PresswallTemplate): string {
  if (template.config.layout === "marquee") {
    return "Scroll";
  }
  if (template.config.layout === "grid") {
    return "Grid";
  }
  return "Bar";
}

function TemplateOption({
  catalog,
  editor,
  selections,
  template,
}: {
  catalog: PresswallEditor["catalog"];
  editor: PresswallEditor;
  selections: PresswallEditor["selections"];
  template: PresswallTemplate;
}) {
  const isSelected = editor.selectedTemplateId === template.id;
  const previewConfig = applyPresswallTemplate(template.id);

  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "relative flex flex-col gap-2.5 rounded-lg border p-2.5 text-left transition-all",
        isSelected
          ? "border-foreground/50 bg-muted/50 ring-1 ring-foreground/30"
          : "hover:border-foreground/20 hover:bg-muted/30"
      )}
      onClick={() => editor.applyTemplate(template.id)}
      type="button"
    >
      {isSelected ? (
        <span className="absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-background">
          <IconCircleCheck className="size-3.5" stroke={2.5} />
        </span>
      ) : null}

      <OnboardingPreview
        catalog={catalog}
        className="pointer-events-none border-black/5"
        config={previewConfig}
        previewTheme={getTemplatePreviewTheme(template.id)}
        scale="sm"
        selections={selections}
      />

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{template.name}</p>
          <Badge className="text-[0.625rem]" variant="secondary">
            {templateLayoutLabel(template)}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
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
  const selectedTemplate = PRESSWALL_TEMPLATES.find(
    (template) => template.id === editor.selectedTemplateId
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4">
      <p className="shrink-0 text-muted-foreground text-xs">
        Step 2 of 3 — Pick a starting look
      </p>

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3 shrink-0">
          <p className="font-medium text-sm">
            Templates
            {selectedTemplate ? (
              <span className="ml-1.5 font-normal text-muted-foreground">
                · {selectedTemplate.name}
              </span>
            ) : null}
          </p>
          <p className="text-muted-foreground text-xs">
            Preview your logos in each style. You can fine-tune colors and
            spacing later in the editor.
          </p>
        </div>

        <div className="mb-4 shrink-0">
          <p className="mb-2 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wide">
            Live preview
          </p>
          <OnboardingPreview
            catalog={editor.catalog}
            config={editor.config}
            previewTheme={getTemplatePreviewTheme(editor.selectedTemplateId)}
            scale="md"
            selections={editor.selections}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-2 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wide">
            All styles
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRESSWALL_TEMPLATES.map((template) => (
              <TemplateOption
                catalog={editor.catalog}
                editor={editor}
                key={template.id}
                selections={editor.selections}
                template={template}
              />
            ))}
          </div>
        </div>
      </div>

      <OnboardingActions
        className="shrink-0 pt-4 pb-6"
        compact
        nextLabel="Next"
        onBack={onBack}
        onNext={onNext}
        showBack
      />
    </div>
  );
}
