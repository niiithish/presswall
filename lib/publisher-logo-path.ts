import { getAppUrl } from "@/lib/app-url";

const TRAILING_SLASH = /\/$/;

/** Bundled logo URL — works for any file extension on disk. */
export function bundledLogoPath(publisherId: string): string {
  return `/api/publishers/${publisherId}/logo`;
}

export function absoluteBundledLogoUrl(publisherId: string): string {
  const appOrigin = getAppUrl().replace(TRAILING_SLASH, "");
  return `${appOrigin}${bundledLogoPath(publisherId)}`;
}
