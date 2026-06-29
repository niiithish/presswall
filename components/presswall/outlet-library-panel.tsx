"use client";

import { IconPhotoUp, IconSearch, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { CustomOutletForm } from "@/components/presswall/custom-outlet-form";
import { PublisherLogo } from "@/components/presswall/publisher-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LOGO_GUIDANCE } from "@/lib/logo-guidance";
import type {
  PublisherCatalogItem,
  SelectedPublisher,
  ShopCustomLogo,
} from "@/lib/presswall-types";
import { PUBLISHER_CATEGORIES } from "@/lib/publishers-seed";
import { cn } from "@/lib/utils";

interface OutletLibraryPanelProps {
  catalog: PublisherCatalogItem[];
  className?: string;
  customLogos: ShopCustomLogo[];
  onDeleteCustom: (logoId: string) => void;
  onToggle: (publisher: PublisherCatalogItem) => void;
  onToggleCustom: (logo: ShopCustomLogo) => void;
  onUploadCustom: (name: string, svg: string) => Promise<boolean>;
  selected: SelectedPublisher[];
}

function PositionBadge({ position }: { position: number }) {
  return (
    <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-foreground bg-foreground px-1 font-semibold text-[0.625rem] text-background tabular-nums shadow-sm">
      {position}
    </span>
  );
}

function LibraryFilters({
  category,
  onCategoryChange,
  onSearchChange,
  search,
}: {
  category: string;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  search: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <IconSearch
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          stroke={2}
        />
        <Input
          autoComplete="off"
          className="h-8 py-0 pl-9 text-xs"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search outlets..."
          type="search"
          value={search}
        />
      </div>
      <Select
        onValueChange={(value) => value && onCategoryChange(value)}
        value={category}
      >
        <SelectTrigger className="h-8 w-32 shrink-0 py-0 text-xs data-[size=default]:h-8">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {PUBLISHER_CATEGORIES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function OutletTile({
  name,
  onToggle,
  position,
  publisherId,
}: {
  name: string;
  onToggle: () => void;
  position: number | null;
  publisherId: string;
}) {
  const selected = position !== null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-label={name}
            aria-pressed={selected}
            className={cn(
              "relative flex h-10 items-center justify-center rounded-md border px-1.5 transition-all",
              selected
                ? "border-border bg-muted/30 ring-1 ring-border/60"
                : "hover:border-border hover:bg-muted/20"
            )}
            onClick={onToggle}
            type="button"
          >
            <PublisherLogo
              className="[--logo-height:0.9375rem] [--logo-max-width:5.5rem]"
              name={name}
              publisherId={publisherId}
            />
            {selected ? <PositionBadge position={position} /> : null}
          </button>
        }
      />
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  );
}

function CustomLogoTile({
  logo,
  onDelete,
  onToggle,
  position,
}: {
  logo: ShopCustomLogo;
  onDelete: () => void;
  onToggle: () => void;
  position: number | null;
}) {
  const selected = position !== null;

  return (
    <div className="flex items-stretch gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              aria-label={
                selected
                  ? `Remove ${logo.name} from press wall`
                  : `Add ${logo.name} to press wall`
              }
              aria-pressed={selected}
              className={cn(
                "relative flex h-10 min-w-0 flex-1 items-center justify-center rounded-md border px-1.5 transition-all",
                selected
                  ? "border-border bg-muted/30 ring-1 ring-border/60"
                  : "hover:border-border hover:bg-muted/20"
              )}
              onClick={onToggle}
              type="button"
            >
              <PublisherLogo
                className="[--logo-height:0.9375rem] [--logo-max-width:5.5rem]"
                customLogoSvg={logo.logoSvg}
                name={logo.name}
              />
              {selected ? <PositionBadge position={position} /> : null}
            </button>
          }
        />
        <TooltipContent>
          {selected
            ? "Remove from press wall"
            : "Add to press wall · saved in your library"}
        </TooltipContent>
      </Tooltip>
      <Button
        aria-label={`Delete ${logo.name} from library`}
        className="h-10 w-8 shrink-0 px-0 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
        size="icon-sm"
        title="Delete from library"
        variant="ghost"
      >
        <IconTrash stroke={2} />
      </Button>
    </div>
  );
}

function OutletGrid({
  catalog,
  category,
  onToggle,
  search,
  selectionPositionByKey,
}: {
  catalog: PublisherCatalogItem[];
  category: string;
  onToggle: (publisher: PublisherCatalogItem) => void;
  search: string;
  selectionPositionByKey: Map<string, number>;
}) {
  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.filter((publisher) => {
      const matchesCategory =
        category === "All" || publisher.category === category;
      const matchesSearch =
        query.length === 0 ||
        publisher.name.toLowerCase().includes(query) ||
        publisher.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [catalog, search, category]);

  if (filteredCatalog.length === 0) {
    return (
      <Empty className="flex-1 border">
        <EmptyHeader>
          <EmptyTitle>No matches</EmptyTitle>
          <EmptyDescription>
            Try a different search or category.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border p-2">
      <div className="grid grid-cols-2 gap-1.5">
        {filteredCatalog.map((publisher) => (
          <OutletTile
            key={publisher.id}
            name={publisher.name}
            onToggle={() => onToggle(publisher)}
            position={selectionPositionByKey.get(publisher.id) ?? null}
            publisherId={publisher.id}
          />
        ))}
      </div>
    </div>
  );
}

export function OutletLibraryPanel({
  catalog,
  customLogos,
  selected,
  onToggle,
  onToggleCustom,
  onUploadCustom,
  onDeleteCustom,
  className,
}: OutletLibraryPanelProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"bundled" | "uploads">("bundled");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShopCustomLogo | null>(null);

  const selectionPositionByKey = useMemo(() => {
    const map = new Map<string, number>();
    selected.forEach((item, index) => {
      const selectionKey =
        item.publisherId ??
        (item.customLogoId ? `custom-${item.customLogoId}` : item.key);
      map.set(selectionKey, index + 1);
    });
    return map;
  }, [selected]);

  const selectionHint =
    selected.length === 0
      ? "Select at least one outlet."
      : "Order follows your selection sequence.";

  const handleUploadAdd = async (name: string, svg: string) => {
    const saved = await onUploadCustom(name, svg);
    if (saved) {
      setTab("uploads");
      setUploadOpen(false);
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <p className="font-medium text-xs">
            Library
            <span className="ml-1 font-normal text-muted-foreground tabular-nums">
              · {selected.length} selected
            </span>
          </p>
          <p className="text-[0.6875rem] text-muted-foreground">
            {selectionHint}
          </p>
        </div>

        <Button
          className="h-7 shrink-0 px-2.5 text-xs"
          onClick={() => setUploadOpen(true)}
          size="sm"
          variant="secondary"
        >
          <IconPhotoUp stroke={2} />
          Upload logo
        </Button>
      </div>

      <Tabs
        className="flex min-h-0 flex-1 flex-col gap-3"
        onValueChange={(value) => setTab(value as "bundled" | "uploads")}
        value={tab}
      >
        <TabsList className="grid h-8 w-full shrink-0 grid-cols-2">
          <TabsTrigger className="text-xs" value="bundled">
            Bundled
            <span className="ml-1 text-muted-foreground tabular-nums">
              {catalog.length}
            </span>
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="uploads">
            Your uploads
            <span className="ml-1 text-muted-foreground tabular-nums">
              {customLogos.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          className="mt-0 flex min-h-0 flex-1 flex-col gap-3 outline-none"
          value="bundled"
        >
          <LibraryFilters
            category={category}
            onCategoryChange={setCategory}
            onSearchChange={setSearch}
            search={search}
          />
          <OutletGrid
            catalog={catalog}
            category={category}
            onToggle={onToggle}
            search={search}
            selectionPositionByKey={selectionPositionByKey}
          />
        </TabsContent>

        <TabsContent
          className="mt-0 flex min-h-0 flex-1 flex-col outline-none"
          value="uploads"
        >
          {customLogos.length === 0 ? (
            <Empty className="flex-1 border">
              <EmptyHeader>
                <EmptyTitle>No uploads yet</EmptyTitle>
                <EmptyDescription>
                  Click Upload logo to add a custom outlet. Uploads stay saved
                  here even when they are not on your press wall.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border p-2">
              <p className="mb-2 text-[0.6875rem] text-muted-foreground">
                Click a logo to add or remove it from your press wall. Use the
                trash icon to delete it from your library.
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {customLogos.map((logo) => (
                  <CustomLogoTile
                    key={logo.id}
                    logo={logo}
                    onDelete={() => setDeleteTarget(logo)}
                    onToggle={() => onToggleCustom(logo)}
                    position={
                      selectionPositionByKey.get(`custom-${logo.id}`) ?? null
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete logo?</DialogTitle>
            <DialogDescription>
              Remove &ldquo;{deleteTarget?.name}&rdquo; from your library
              permanently. Clicking the logo only removes it from your press
              wall.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeleteTarget(null)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteTarget) {
                  onDeleteCustom(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setUploadOpen} open={uploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload a logo</DialogTitle>
            <DialogDescription>
              Add a custom outlet with a PNG on a transparent background.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground text-xs">
            {LOGO_GUIDANCE.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <CustomOutletForm compact featured onAdd={handleUploadAdd} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
