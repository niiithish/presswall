import { MAX_CUSTOM_LOGO_SVG_LENGTH } from "@/lib/presswall-validation";

const SCRIPT_TAG = /<script[\s\S]*?<\/script>/gi;
const FOREIGN_OBJECT_TAG = /<foreignObject[\s\S]*?<\/foreignObject>/gi;
const EVENT_HANDLER_ATTR = /\s(on\w+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URI = /javascript:/gi;
const SVG_ROOT = /<svg[\s>]/i;

export function sanitizeSvg(svg: string): string {
  const trimmed = svg.trim();
  if (!trimmed) {
    return "";
  }

  const cleaned = trimmed
    .slice(0, MAX_CUSTOM_LOGO_SVG_LENGTH)
    .replace(SCRIPT_TAG, "")
    .replace(FOREIGN_OBJECT_TAG, "")
    .replace(EVENT_HANDLER_ATTR, "")
    .replace(JAVASCRIPT_URI, "");

  if (!SVG_ROOT.test(cleaned)) {
    return "";
  }

  return cleaned;
}
