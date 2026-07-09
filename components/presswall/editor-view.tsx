"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EditorShellSkeleton } from "@/components/presswall/editor-shell-skeleton";
import { EditorUnsavedGuard } from "@/components/presswall/editor-unsaved-guard";
import { EditorWorkspace } from "@/components/presswall/editor-workspace";
import { ThemeActivationBanner } from "@/components/presswall/theme-activation-banner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { usePresswallEditor } from "@/hooks/use-presswall-editor";
import { navigateAdminPath } from "@/lib/admin-navigation";
import { buildAdminPath } from "@/lib/admin-path";
import {
  isAppWindowRequest,
  openEditorAppWindow,
} from "@/lib/editor-app-window";

export function EditorView() {
  const editor = usePresswallEditor();
  const searchParams = useSearchParams();
  const router = useRouter();
  const inAppWindow = useMemo(
    () => isAppWindowRequest(searchParams),
    [searchParams]
  );
  /**
   * Sidebar / deep-link hits `/editor` inside the admin iframe. Promote that
   * navigation into Shopify App Window (same as Home → Open editor). Until
   * promotion finishes we show a shell; if App Window is unavailable we stay
   * on the in-iframe editor.
   */
  const [iframeFallback, setIframeFallback] = useState(false);

  useEffect(() => {
    if (inAppWindow) {
      return;
    }

    let cancelled = false;

    openEditorAppWindow()
      .then((opened) => {
        if (cancelled) {
          return;
        }

        if (opened) {
          // Soft-navigate the host frame to Home so closing the overlay
          // returns to the overview (root layout keeps <s-app-window> mounted).
          router.replace(buildAdminPath("/"));
          return;
        }

        setIframeFallback(true);
      })
      .catch(() => {
        if (!cancelled) {
          setIframeFallback(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inAppWindow, router]);

  useEffect(() => {
    if (!editor.isLoading && editor.needsOnboarding) {
      navigateAdminPath("/").catch(() => undefined);
    }
  }, [editor.isLoading, editor.needsOnboarding]);

  // Sidebar entry: wait for App Window promotion (or fallback) before painting.
  if (!(inAppWindow || iframeFallback)) {
    return <EditorShellSkeleton />;
  }

  if (editor.isLoading || editor.needsOnboarding) {
    return <EditorShellSkeleton />;
  }

  if (editor.loadError) {
    return (
      <div className="flex h-svh items-center justify-center p-6">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyTitle>Could not load editor</EmptyTitle>
            <EmptyDescription>
              Settings failed to load. Retry after migrations are applied or
              reload from Shopify admin.
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

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      {/*
        Title only — App Window action slots only accept Shopify `s-button`
        chrome (Polaris), not our custom Button. Save / Discard live in the
        live-preview toolbar via components/ui/button.
      */}
      <s-page heading="Edit press logos" />

      <EditorUnsavedGuard
        isDirty={editor.isDirty}
        onDiscard={editor.discard}
        onSave={editor.save}
      />

      {inAppWindow ? null : <ThemeActivationBanner variant="compact" />}

      {editor.unavailableCount > 0 ? (
        <Alert className="shrink-0 rounded-none border-x-0 border-t-0 py-2">
          <AlertTitle className="text-sm">
            Some outlets are no longer available
          </AlertTitle>
          <AlertDescription className="text-xs">
            {editor.unavailableCount} previously selected outlet
            {editor.unavailableCount === 1 ? "" : "s"} will not show on your
            storefront. Remove them or save to update.
          </AlertDescription>
        </Alert>
      ) : null}

      <div
        className={
          inAppWindow
            ? "flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 pb-4 sm:px-4"
            : "flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-4 pb-6 sm:px-6"
        }
      >
        <EditorWorkspace editor={editor} fullBleed={inAppWindow} />
      </div>
    </div>
  );
}
