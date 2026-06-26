import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readBundledPublisherLogo } from "@/lib/read-bundled-logo";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const logo = await readBundledPublisherLogo(id);

  if (!logo) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(logo.body, {
    headers: {
      "Cache-Control": "public, max-age=86400, immutable",
      "Content-Type": logo.contentType,
    },
  });
}
