"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingActionsProps {
  backLabel?: string;
  className?: string;
  compact?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextLoading?: boolean;
  onBack?: () => void;
  onNext: () => void;
  showBack?: boolean;
}

export function OnboardingActions({
  onBack,
  onNext,
  showBack = false,
  backLabel = "Back",
  nextLabel = "Next",
  nextDisabled = false,
  nextLoading = false,
  compact = false,
  className,
}: OnboardingActionsProps) {
  const buttonSize = compact ? "sm" : "lg";
  const nextClassName = compact ? "min-w-24" : "min-w-32";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        compact && "px-1",
        className
      )}
    >
      {showBack && onBack ? (
        <Button onClick={onBack} size={buttonSize} variant="ghost">
          <IconArrowLeft stroke={2} />
          {backLabel}
        </Button>
      ) : (
        <span aria-hidden />
      )}

      <Button
        className={nextClassName}
        disabled={nextDisabled || nextLoading}
        onClick={onNext}
        size={buttonSize}
      >
        {nextLoading ? "Saving..." : nextLabel}
        {nextLoading ? null : <IconArrowRight stroke={2} />}
      </Button>
    </div>
  );
}
