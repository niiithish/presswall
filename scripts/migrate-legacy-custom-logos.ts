import { migrateLegacyCustomLogosForAllShops } from "../lib/migrate-legacy-custom-logos";

await migrateLegacyCustomLogosForAllShops();
console.log("Legacy custom logo migration complete.");
