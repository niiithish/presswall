export function getAppUrl(): string {
  return (
    process.env.SHOPIFY_APP_URL ?? process.env.HOST ?? "http://localhost:3000"
  );
}
