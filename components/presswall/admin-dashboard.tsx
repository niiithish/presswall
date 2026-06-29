"use client";

import { MerchantOverview } from "@/components/presswall/merchant-overview";
import { OnboardingAdminView } from "@/components/presswall/onboarding-admin-view";
import { OnboardingShellSkeleton } from "@/components/presswall/onboarding-shell-skeleton";
import { ThemeActivationProvider } from "@/components/presswall/theme-activation-provider";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  type PresswallEditor,
  usePresswallEditor,
} from "@/hooks/use-presswall-editor";
import { merchantOverviewFromEditor } from "@/lib/merchant-overview-data";

export function AdminDashboardView({ editor }: { editor: PresswallEditor }) {
  if (editor.isLoading) {
    return <OnboardingShellSkeleton />;
  }

  if (editor.loadError) {
    return (
      <div className="flex h-svh items-center justify-center p-6">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyTitle>Could not load Presswall</EmptyTitle>
            <EmptyDescription>
              Settings failed to load. This can happen after a schema change —
              retry after migrations are applied.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            className="mt-4"
            onClick={() => {
              editor.reload().catch(() => undefined);
            }}
            type="button"
          >
            Retry
          </Button>
        </Empty>
      </div>
    );
  }

  if (editor.needsOnboarding) {
    return <OnboardingAdminView editor={editor} />;
  }

  return (
    <ThemeActivationProvider>
      <div className="flex h-svh flex-col overflow-hidden bg-background">
        <MerchantOverview data={merchantOverviewFromEditor(editor)} />
      </div>
    </ThemeActivationProvider>
  );
}

export function AdminDashboard() {
  const editor = usePresswallEditor();

  return <AdminDashboardView editor={editor} />;
}
