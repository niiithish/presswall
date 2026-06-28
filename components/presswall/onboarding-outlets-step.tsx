"use client";

import { IconChevronRight, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { CustomOutletForm } from "@/components/presswall/custom-outlet-form";
import { OnboardingActions } from "@/components/presswall/onboarding-actions";
import { PublisherLogo } from "@/components/presswall/publisher-logo";
import { Input } from "@/components/ui/input";
import type { PresswallEditor } from "@/hooks/use-presswall-editor";
import type { SelectedPublisher } from "@/lib/presswall-types";
import { cn } from "@/lib/utils";

interface OnboardingOutletsStepProps {
  editor: PresswallEditor;
  onNext: () => void;
}

function CustomLogoTile({
  editor,
  item,
}: {
  editor: PresswallEditor;
  item: SelectedPublisher;
}) {
  const name = item.customName ?? "Custom outlet";

  return (
    <button
      aria-label={`Remove ${name}`}
      className="flex h-11 items-center justify-center rounded-lg bg-muted/60 px-2 ring-1 ring-foreground transition-colors hover:bg-muted"
      onClick={() => editor.removePublisher(item.key)}
      title={`Remove ${name}`}
      type="button"
    >
      <PublisherLogo
        className="[--logo-height:1.35rem]"
        customLogoSvg={item.customLogoSvg}
        name={name}
      />
    </button>
  );
}

export function OnboardingOutletsStep({
  editor,
  onNext,
}: OnboardingOutletsStepProps) {
  const [search, setSearch] = useState("");
  const [uploadsOpen, setUploadsOpen] = useState(true);

  const uploadedLogos = useMemo(
    () => editor.selected.filter((item) => !item.publisherId),
    [editor.selected]
  );

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    return editor.catalog.filter((publisher) => {
      if (query.length === 0) {
        return true;
      }

      return (
        publisher.name.toLowerCase().includes(query) ||
        publisher.category.toLowerCase().includes(query)
      );
    });
  }, [editor.catalog, search]);

  const canContinue = editor.selected.length > 0;

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">
          Add your press logos
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Build your logo library on the left — upload your own or add bundled
          press outlets.
        </p>
      </div>

      <div className="grid min-h-[22rem] gap-4 md:grid-cols-[1.7fr_1fr]">
        <div className="flex min-h-0 flex-col rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="font-medium text-sm">Logo library</p>
            <p className="text-muted-foreground text-xs">
              {editor.selected.length} selected
            </p>
          </div>

          <button
            className="flex w-full items-center gap-2 text-left"
            onClick={() => setUploadsOpen((open) => !open)}
            type="button"
          >
            <IconChevronRight
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                uploadsOpen && "rotate-90"
              )}
              stroke={2}
            />
            <span className="font-medium text-xs">Your uploads</span>
            <span className="text-muted-foreground text-xs">
              {uploadedLogos.length}
            </span>
          </button>

          {uploadsOpen ? (
            <div className="mt-3 min-h-12">
              {uploadedLogos.length > 0 ? (
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6">
                  {uploadedLogos.map((item) => (
                    <CustomLogoTile
                      editor={editor}
                      item={item}
                      key={item.key}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="my-4 border-t" />

          <div className="space-y-3">
            <div className="space-y-0.5">
              <p className="font-medium text-xs">Bundled outlets</p>
              <p className="text-muted-foreground text-xs">
                {editor.catalog.length} press logos included
              </p>
            </div>

            <div className="relative">
              <IconSearch
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                stroke={2}
              />
              <Input
                autoComplete="off"
                className="h-9 pl-9"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bundled outlets..."
                type="search"
                value={search}
              />
            </div>

            <div className="max-h-52 overflow-y-auto rounded-lg border p-2">
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6">
                {filteredCatalog.map((publisher) => {
                  const selected = editor.selectedIds.has(publisher.id);
                  return (
                    <button
                      aria-label={publisher.name}
                      aria-pressed={selected}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg px-2 transition-colors",
                        selected
                          ? "bg-muted ring-1 ring-foreground"
                          : "hover:bg-muted/50"
                      )}
                      key={publisher.id}
                      onClick={() => editor.togglePublisher(publisher)}
                      title={publisher.name}
                      type="button"
                    >
                      <PublisherLogo
                        className="[--logo-height:1.25rem]"
                        name={publisher.name}
                        publisherId={publisher.id}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border border-foreground/25 border-dashed bg-muted/15 p-4">
          <div className="mb-4 space-y-1">
            <p className="font-medium text-sm">Upload a logo</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              PNG with a transparent background. Adds under your uploads in the
              library.
            </p>
          </div>

          <CustomOutletForm
            compact
            featured
            onAdd={(name, svg) => {
              editor.addCustomPublisher(name, svg);
              setUploadsOpen(true);
            }}
          />
        </div>
      </div>

      <OnboardingActions
        nextDisabled={!canContinue}
        nextLabel="Next"
        onNext={onNext}
      />
    </div>
  );
}
