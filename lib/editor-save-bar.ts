/** Shared id for the editor App Bridge save bar (must live on the parent page). */
export const EDITOR_SAVE_BAR_ID = "presswall-editor-save-bar";

/** postMessage protocol between App Window host (parent) and editor iframe. */
export const EDITOR_SAVE_BAR_MESSAGE = {
  dirty: "presswall:editor-dirty",
  discard: "presswall:editor-discard",
  save: "presswall:editor-save",
} as const;

interface SaveBarApi {
  hide?: (id: string) => Promise<void>;
  leaveConfirmation?: () => Promise<void>;
  show?: (id: string) => Promise<void>;
  toggle?: (id: string) => Promise<void>;
}

function getSaveBarApi(): SaveBarApi | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.shopify?.saveBar ?? null;
}

/**
 * App Bridge rejects unknown attributes (e.g. `class`) on `<ui-save-bar>`.
 * React sometimes still writes `class=""` on custom elements — strip before API calls.
 */
function sanitizeSaveBarElement(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  const element = document.getElementById(EDITOR_SAVE_BAR_ID);
  if (!element) {
    return null;
  }

  // Only `id` (and children) are valid on ui-save-bar.
  for (const attr of [...element.attributes]) {
    if (attr.name !== "id") {
      element.removeAttribute(attr.name);
    }
  }

  return element;
}

/**
 * Mount a parent-page `<ui-save-bar>` outside React so App Bridge never sees
 * React-managed attributes like `class`.
 */
export function ensureEditorSaveBarElement(options: {
  onDiscard: () => void;
  onSave: () => void;
}): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  let bar = document.getElementById(EDITOR_SAVE_BAR_ID);
  if (!bar) {
    bar = document.createElement("ui-save-bar");
    bar.id = EDITOR_SAVE_BAR_ID;

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.setAttribute("variant", "primary");
    saveButton.textContent = "Save";
    saveButton.dataset.presswallSaveBarAction = "save";

    const discardButton = document.createElement("button");
    discardButton.type = "button";
    discardButton.textContent = "Discard";
    discardButton.dataset.presswallSaveBarAction = "discard";

    bar.append(saveButton, discardButton);
    document.body.append(bar);
  }

  sanitizeSaveBarElement();

  const onClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.closest<HTMLElement>(
      "[data-presswall-save-bar-action]"
    )?.dataset.presswallSaveBarAction;

    if (action === "save") {
      options.onSave();
      return;
    }

    if (action === "discard") {
      options.onDiscard();
    }
  };

  bar.addEventListener("click", onClick);

  return () => {
    bar?.removeEventListener("click", onClick);
  };
}

/** Show or hide the App Bridge save bar based on dirty state. */
export async function syncEditorSaveBar(isDirty: boolean): Promise<void> {
  const saveBar = getSaveBarApi();
  if (!(saveBar?.show && saveBar.hide)) {
    return;
  }

  sanitizeSaveBarElement();

  try {
    if (isDirty) {
      await saveBar.show(EDITOR_SAVE_BAR_ID);
    } else {
      await saveBar.hide(EDITOR_SAVE_BAR_ID);
    }
  } catch {
    // App Bridge may be unavailable outside the embedded admin.
  }
}

/**
 * Prompt before leaving when the save bar is showing (unsaved changes).
 * Resolves after the merchant confirms, or immediately if nothing is dirty.
 */
export async function confirmLeaveEditorIfDirty(): Promise<void> {
  const saveBar = getSaveBarApi();
  if (!saveBar?.leaveConfirmation) {
    return;
  }

  try {
    await saveBar.leaveConfirmation();
  } catch {
    throw new Error("Leave cancelled");
  }
}

export function isEditorSaveBarMessage(
  data: unknown
): data is { type: string } {
  if (!data || typeof data !== "object" || !("type" in data)) {
    return false;
  }

  const type = (data as { type: unknown }).type;
  return (
    type === EDITOR_SAVE_BAR_MESSAGE.dirty ||
    type === EDITOR_SAVE_BAR_MESSAGE.discard ||
    type === EDITOR_SAVE_BAR_MESSAGE.save
  );
}
