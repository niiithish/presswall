import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionForRequest } from "@/lib/auth-helpers";
import {
  createShopCustomLogo,
  deleteShopCustomLogo,
  getShopCustomLogos,
} from "@/lib/custom-logo-service";
import { MAX_CUSTOM_LOGO_SVG_LENGTH } from "@/lib/presswall-validation";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  logoSvg: z.string().min(1).max(MAX_CUSTOM_LOGO_SVG_LENGTH),
});

export async function GET(request: NextRequest) {
  const session = await getSessionForRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logos = await getShopCustomLogos(session.shop);
  return NextResponse.json({ logos });
}

export async function POST(request: NextRequest) {
  const session = await getSessionForRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const logo = await createShopCustomLogo(
      session.shop,
      parsed.data.name,
      parsed.data.logoSvg
    );

    return NextResponse.json({ logo });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save custom logo";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionForRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logoId = request.nextUrl.searchParams.get("id")?.trim();
  if (!logoId) {
    return NextResponse.json({ error: "Missing logo id" }, { status: 400 });
  }

  await deleteShopCustomLogo(session.shop, logoId);
  return NextResponse.json({ ok: true });
}
