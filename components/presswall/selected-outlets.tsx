"use client";

import { IconArrowDown, IconArrowUp, IconX } from "@tabler/icons-react";
import { PublisherLogo } from "@/components/presswall/publisher-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  PublisherCatalogItem,
  SelectedPublisher,
} from "@/lib/presswall-types";

interface SelectedOutletsProps {
  catalogById: Map<string, PublisherCatalogItem>;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
  selected: SelectedPublisher[];
}

export function SelectedOutlets({
  selected,
  catalogById,
  onMove,
  onRemove,
}: SelectedOutletsProps) {
  if (selected.length === 0) {
    return (
      <Empty className="border-dashed">
        <EmptyHeader>
          <EmptyTitle>No outlets selected</EmptyTitle>
          <EmptyDescription>
            Pick outlets from the library or add a custom one below.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {selected.map((item, index) => {
        const publisher = item.publisherId
          ? catalogById.get(item.publisherId)
          : null;
        const label = publisher?.name ?? item.customName ?? "Custom";
        const customLogoSvg = item.customLogoSvg;

        return (
          <div
            className="flex items-center gap-3 rounded-lg border px-3 py-2"
            key={item.key}
          >
            <Badge className="tabular-nums" variant="secondary">
              {index + 1}
            </Badge>

            <div className="flex h-6 w-24 shrink-0 items-center justify-center px-0.5">
              <PublisherLogo
                className="[--logo-height:1.25rem]"
                customLogoSvg={customLogoSvg}
                name={label}
                publisherId={publisher?.id}
              />
            </div>

            <span className="min-w-0 flex-1 truncate font-medium text-sm">
              {label}
            </span>

            <div className="flex items-center gap-1">
              <Button
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
                size="icon-sm"
                variant="ghost"
              >
                <IconArrowUp stroke={2} />
              </Button>
              <Button
                disabled={index === selected.length - 1}
                onClick={() => onMove(index, 1)}
                size="icon-sm"
                variant="ghost"
              >
                <IconArrowDown stroke={2} />
              </Button>
              <Button
                onClick={() => onRemove(item.key)}
                size="icon-sm"
                variant="ghost"
              >
                <IconX className="text-muted-foreground" stroke={2} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
