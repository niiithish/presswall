"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface OnboardingActionsProps {
  backLabel?: string;
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
}: OnboardingActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {showBack && onBack ? (
        <Button onClick={onBack} size="lg" variant="ghost">
          <IconArrowLeft stroke={2} />
          {backLabel}
        </Button>
      ) : (
        <span aria-hidden className="min-w-20" />
      )}

      <Button
        className="min-w-32"
        disabled={nextDisabled || nextLoading}
        onClick={onNext}
        size="lg"
      >
        {nextLoading ? "Saving..." : nextLabel}
        {nextLoading ? null : <IconArrowRight stroke={2} />}
      </Button>
    </div>
  );
}
