import { eq } from "drizzle-orm";
import { sessionStorage } from "@/lib/session-storage";
import { db } from "@/src/db";
import {
  shopBannerAssignments,
  shopConfigs,
  shopCustomLogos,
  shopCustomTemplates,
  shopPublishers,
} from "@/src/db/schema";

export async function purgeShopData(shop: string) {
  const shopSessions = await sessionStorage.findSessionsByShop(shop);
  const sessionIds = shopSessions.map((session) => session.id);

  await db.transaction(async (tx) => {
    await tx
      .delete(shopBannerAssignments)
      .where(eq(shopBannerAssignments.shop, shop));
    await tx.delete(shopCustomLogos).where(eq(shopCustomLogos.shop, shop));
    await tx
      .delete(shopCustomTemplates)
      .where(eq(shopCustomTemplates.shop, shop));
    await tx.delete(shopPublishers).where(eq(shopPublishers.shop, shop));
    await tx.delete(shopConfigs).where(eq(shopConfigs.shop, shop));
  });

  await sessionStorage.deleteSessions(sessionIds);
}
