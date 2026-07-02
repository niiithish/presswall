import type { Session } from "@shopify/shopify-api";
import { sessionStorage } from "@/lib/session-storage";
import { shopify } from "@/lib/shopify";

function isNonExpiringOfflineSession(session: Session): boolean {
  return (
    !session.isOnline && Boolean(session.accessToken) && !session.refreshToken
  );
}

function isAccessTokenExpired(session: Session): boolean {
  if (!session.expires) {
    return false;
  }

  return session.expires.getTime() <= Date.now();
}

export async function ensureOfflineSession(session: Session): Promise<Session> {
  if (session.isOnline || !session.accessToken) {
    return session;
  }

  if (isNonExpiringOfflineSession(session)) {
    const { session: migrated } = await shopify.auth.migrateToExpiringToken({
      shop: session.shop,
      nonExpiringOfflineAccessToken: session.accessToken,
    });
    await sessionStorage.storeSession(migrated);
    return migrated;
  }

  if (isAccessTokenExpired(session) && session.refreshToken) {
    const { session: refreshed } = await shopify.auth.refreshToken({
      shop: session.shop,
      refreshToken: session.refreshToken,
    });
    await sessionStorage.storeSession(refreshed);
    return refreshed;
  }

  return session;
}
