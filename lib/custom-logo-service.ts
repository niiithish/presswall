import { and, asc, eq } from "drizzle-orm";
import type { ShopCustomLogo } from "@/lib/presswall-types";
import { sanitizeSvg } from "@/lib/svg-sanitize";
import { db } from "@/src/db";
import { shopCustomLogos, shopPublishers } from "@/src/db/schema";

function mapCustomLogoRow(
  row: typeof shopCustomLogos.$inferSelect
): ShopCustomLogo {
  return {
    id: row.id,
    name: row.name,
    logoSvg: row.logoSvg,
    createdAt: row.createdAt,
  };
}

async function migrateLegacyCustomLogos(shop: string): Promise<void> {
  const legacyRows = await db
    .select()
    .from(shopPublishers)
    .where(eq(shopPublishers.shop, shop));

  for (const row of legacyRows) {
    if (!row.customLogoSvg?.trim() || row.customLogoId) {
      continue;
    }

    const sanitized = sanitizeSvg(row.customLogoSvg);
    if (!sanitized) {
      continue;
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.insert(shopCustomLogos).values({
      id,
      shop,
      name: row.customName?.trim() || "Custom outlet",
      logoSvg: sanitized,
      createdAt,
    });

    await db
      .update(shopPublishers)
      .set({ customLogoId: id })
      .where(eq(shopPublishers.id, row.id));
  }
}

export async function getShopCustomLogos(
  shop: string
): Promise<ShopCustomLogo[]> {
  await migrateLegacyCustomLogos(shop);

  const rows = await db
    .select()
    .from(shopCustomLogos)
    .where(eq(shopCustomLogos.shop, shop))
    .orderBy(asc(shopCustomLogos.createdAt));

  return rows.map(mapCustomLogoRow);
}

export async function createShopCustomLogo(
  shop: string,
  name: string,
  logoSvg: string
): Promise<ShopCustomLogo> {
  const sanitized = sanitizeSvg(logoSvg);
  if (!sanitized) {
    throw new Error("Custom outlet logo is invalid after sanitization");
  }

  const logo: ShopCustomLogo = {
    id: crypto.randomUUID(),
    name: name.trim(),
    logoSvg: sanitized,
    createdAt: new Date().toISOString(),
  };

  await db.insert(shopCustomLogos).values({
    id: logo.id,
    shop,
    name: logo.name,
    logoSvg: logo.logoSvg,
    createdAt: logo.createdAt,
  });

  return logo;
}

export async function deleteShopCustomLogo(
  shop: string,
  logoId: string
): Promise<void> {
  await db
    .delete(shopCustomLogos)
    .where(and(eq(shopCustomLogos.id, logoId), eq(shopCustomLogos.shop, shop)));

  await db
    .delete(shopPublishers)
    .where(
      and(
        eq(shopPublishers.shop, shop),
        eq(shopPublishers.customLogoId, logoId)
      )
    );
}
