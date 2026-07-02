import type { NextRequest } from "next/server";
import { purgeShopData } from "@/lib/shop-cleanup";
import { shopify } from "@/lib/shopify";

function parseWebhookPayload(rawBody: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(rawBody);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function readCustomerFields(payload: Record<string, unknown>) {
  const customer = payload.customer;
  if (typeof customer !== "object" || customer === null) {
    return { id: null, email: null, phone: null };
  }

  const fields = customer as Record<string, unknown>;
  return {
    id: fields.id ?? null,
    email: fields.email ?? null,
    phone: fields.phone ?? null,
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const validation = await shopify.webhooks.validate({
    rawBody,
    rawRequest: request,
  });

  if (!validation.valid) {
    return new Response("Invalid webhook", { status: 401 });
  }

  const topic = validation.topic;
  const shop = validation.domain;
  const payload = parseWebhookPayload(rawBody);

  switch (topic) {
    case "APP_UNINSTALLED":
    case "SHOP_REDACT":
      if (shop) {
        await purgeShopData(shop);
      }
      break;
    case "CUSTOMERS_DATA_REQUEST":
      // Presswall does not store Shopify customer personal data.
      break;
    case "CUSTOMERS_REDACT":
      // Presswall does not store Shopify customer personal data.
      break;
    default:
      break;
  }

  if (topic === "CUSTOMERS_DATA_REQUEST") {
    return Response.json({
      shop_id: payload.shop_id ?? null,
      shop_domain: shop ?? payload.shop_domain ?? null,
      customer: readCustomerFields(payload),
      data_request: payload.data_request ?? null,
      orders_requested: [],
      customer_data: [],
    });
  }

  return new Response(null, { status: 200 });
}
