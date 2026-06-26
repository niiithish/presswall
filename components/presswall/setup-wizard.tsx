"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CustomOutletForm } from "@/components/presswall/custom-outlet-form";
import { PresswallPreviewPair } from "@/components/presswall/preview-pair";
import { PublisherLibrary } from "@/components/presswall/publisher-library";
import { SelectedOutlets } from "@/components/presswall/selected-outlets";
import { StyleControls } from "@/components/presswall/style-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PresswallEditor } from "@/hooks/use-presswall-editor";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "outlets",
    title: "Select outlets",
    description:
      "Pick outlets from the library, reorder them, or add custom ones.",
  },
  {
    id: "style",
    title: "Customize style",
    description: "Adjust the heading, colors, and layout for your storefront.",
  },
  {
    id: "preview",
    title: "Preview",
    description: "See how your presswall will look before saving.",
  },
] as const;

interface SetupWizardProps {
  editor: PresswallEditor;
  initialStep?: number;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function SetupWizard({
  open,
  onOpenChange,
  initialStep = 0,
  editor,
}: SetupWizardProps) {
  const [step, setStep] = useState(initialStep);

  useEffect(() => {
    if (open) {
      setStep(initialStep);
    }
  }, [open, initialStep]);

  const isFirstStep = step === 0;
  const isLastStep = step === STEPS.length - 1;
  const currentStep = STEPS[step];

  const goNext = () => {
    if (!isLastStep) {
      setStep((current) => current + 1);
    }
  };

  const goBack = () => {
    if (!isFirstStep) {
      setStep((current) => current - 1);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="top-[4vh] left-1/2 flex max-h-[min(88vh,680px)] w-[min(32rem,calc(100%-2.5rem))] max-w-none -translate-x-1/2 translate-y-0 flex-col gap-0 overflow-hidden p-0 shadow-lg"
        showCloseButton
      >
        <DialogHeader className="gap-3 border-b px-5 py-4">
          <div className="flex flex-col gap-1 pr-8">
            <DialogTitle>Set up your presswall</DialogTitle>
            <DialogDescription>{currentStep.description}</DialogDescription>
          </div>

          <ol className="flex w-full items-center justify-between gap-3">
            {STEPS.map((item, index) => {
              const isActive = index === step;
              const isComplete = index < step;

              return (
                <li className="flex items-center gap-1.5" key={item.id}>
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border font-medium text-[0.625rem]",
                      isActive &&
                        "border-primary bg-primary text-primary-foreground",
                      isComplete &&
                        "border-primary/30 bg-primary/10 text-primary",
                      !(isActive || isComplete) &&
                        "border-border text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <IconCircleCheck className="size-3.5" stroke={2} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[0.6875rem]",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === 0 ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="font-medium text-sm">Outlet library</h3>
                  <p className="text-muted-foreground text-xs">
                    {editor.catalog.length} built-in outlets. Search and check
                    the ones you want to feature.
                  </p>
                </div>
                <PublisherLibrary
                  catalog={editor.catalog}
                  category={editor.category}
                  listClassName="h-48"
                  onCategoryChange={editor.setCategory}
                  onSearchChange={editor.setSearch}
                  onToggle={editor.togglePublisher}
                  search={editor.search}
                  selectedIds={editor.selectedIds}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="font-medium text-sm">Selected outlets</h3>
                  <p className="text-muted-foreground text-xs">
                    Reorder with the arrows. The top outlet appears first.
                  </p>
                </div>
                <SelectedOutlets
                  catalogById={editor.catalogById}
                  onMove={editor.movePublisher}
                  onRemove={editor.removePublisher}
                  selected={editor.selected}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="font-medium text-sm">Custom outlet</h3>
                  <p className="text-muted-foreground text-xs">
                    Add a podcast, local news site, or blog not in the library.
                  </p>
                </div>
                <CustomOutletForm onAdd={editor.addCustomPublisher} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <StyleControls
              config={editor.config}
              onUpdate={editor.updateConfig}
            />
          ) : null}

          {step === 2 ? (
            <PresswallPreviewPair
              catalog={editor.catalog}
              config={editor.config}
              selections={editor.selections}
            />
          ) : null}
        </div>

        <DialogFooter className="border-t px-5 py-3">
          <Button disabled={isFirstStep} onClick={goBack} variant="outline">
            <IconArrowLeft stroke={2} />
            Back
          </Button>
          {isLastStep ? (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          ) : (
            <Button onClick={goNext}>
              Next
              <IconArrowRight stroke={2} />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
