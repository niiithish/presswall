export const PENDING_CUSTOM_LOGO_PREFIX = "pending-";

export function isPendingCustomLogoId(id: string): boolean {
  return id.startsWith(PENDING_CUSTOM_LOGO_PREFIX);
}

export function createPendingCustomLogoId(): string {
  return `${PENDING_CUSTOM_LOGO_PREFIX}${crypto.randomUUID()}`;
}
