import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { sanitizeSvg } from "@/lib/svg-sanitize";
import { db } from "@/src/db";
import { shopCustomLogos, shopPublishers } from "@/src/db/schema";

export async function migrateLegacyCustomLogosForAllShops(): Promise<void> {
  const legacyRows = await db
    .select()
    .from(shopPublishers)
    .where(
      and(
        isNull(shopPublishers.customLogoId),
        isNotNull(shopPublishers.customLogoSvg)
      )
    );

  const shops = [...new Set(legacyRows.map((row) => row.shop))];

  for (const shop of shops) {
    await db.transaction(async (tx) => {
      const rows = legacyRows.filter((row) => row.shop === shop);

      for (const row of rows) {
        const sanitized = sanitizeSvg(row.customLogoSvg ?? "");
        if (!sanitized) {
          await tx.delete(shopPublishers).where(eq(shopPublishers.id, row.id));
          continue;
        }

        const id = `legacy-${row.id}`;
        const createdAt = new Date().toISOString();

        await tx
          .insert(shopCustomLogos)
          .values({
            id,
            shop,
            name: row.customName?.trim() || "Custom outlet",
            logoSvg: sanitized,
            createdAt,
          })
          .onConflictDoNothing();

        await tx
          .update(shopPublishers)
          .set({ customLogoId: id, customLogoSvg: null, customName: null })
          .where(eq(shopPublishers.id, row.id));
      }

      const invalidCustomRows = await tx
        .select()
        .from(shopPublishers)
        .where(
          and(
            eq(shopPublishers.shop, shop),
            isNull(shopPublishers.publisherId),
            isNull(shopPublishers.customLogoId)
          )
        );

      for (const row of invalidCustomRows) {
        await tx.delete(shopPublishers).where(eq(shopPublishers.id, row.id));
      }
    });
  }
}
