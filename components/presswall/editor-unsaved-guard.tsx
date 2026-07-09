"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EDITOR_SAVE_BAR_MESSAGE,
  isEditorSaveBarMessage,
  syncEditorSaveBar,
} from "@/lib/editor-save-bar";

interface EditorUnsavedGuardProps {
  isDirty: boolean;
  onDiscard: () => void;
  onSave: () => Promise<void>;
}

/**
 * Protects the editor from accidental leave when there are unsaved changes.
 *
 * - Syncs App Bridge save bar (element lives on the parent page next to
 *   s-app-window — not here, so button labels never leak into the editor UI).
 * - Listens for Save/Discard from the parent save bar via postMessage.
 * - In-app Escape dialog as a fallback when focus is inside this iframe.
 */
export function EditorUnsavedGuard({
  isDirty,
  onDiscard,
  onSave,
}: EditorUnsavedGuardProps) {
  const [escapeDialogOpen, setEscapeDialogOpen] = useState(false);

  useEffect(() => {
    syncEditorSaveBar(isDirty).catch(() => undefined);

    // Also notify parent frame (covers App Window host on the outer page).
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: EDITOR_SAVE_BAR_MESSAGE.dirty, dirty: isDirty },
        window.location.origin
      );
    }

    return () => {
      syncEditorSaveBar(false).catch(() => undefined);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: EDITOR_SAVE_BAR_MESSAGE.dirty, dirty: false },
          window.location.origin
        );
      }
    };
  }, [isDirty]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (!isEditorSaveBarMessage(event.data)) {
        return;
      }

      if (event.data.type === EDITOR_SAVE_BAR_MESSAGE.save) {
        onSave().catch(() => undefined);
        return;
      }

      if (event.data.type === EDITOR_SAVE_BAR_MESSAGE.discard) {
        onDiscard();
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [onDiscard, onSave]);

  useEffect(() => {
    if (!isDirty) {
      setEscapeDialogOpen(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setEscapeDialogOpen(true);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isDirty]);

  return (
    <Dialog onOpenChange={setEscapeDialogOpen} open={escapeDialogOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Discard unsaved changes?</DialogTitle>
          <DialogDescription>
            You have unsaved edits to your press strip. If you leave now, those
            changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => setEscapeDialogOpen(false)}
            type="button"
            variant="outline"
          >
            Keep editing
          </Button>
          <Button
            onClick={() => {
              onDiscard();
              setEscapeDialogOpen(false);
            }}
            type="button"
          >
            Discard changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
