/**
 * App Bridge sidebar links use app-relative paths. Embedded shop/host params are
 * preserved by App Bridge navigation — do not bake window.search into hrefs or
 * SSR and client hydration will diverge.
 */
export function getPresswallNavPaths() {
  return {
    home: "/",
    editor: "/editor",
  };
}
