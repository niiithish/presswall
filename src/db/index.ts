import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { getTursoConfig } from "./constants";
import {
  publishers,
  sessions,
  shopBannerAssignments,
  shopConfigs,
  shopCustomLogos,
  shopCustomTemplates,
  shopPublishers,
} from "./schema";

const schema = {
  sessions,
  publishers,
  shopConfigs,
  shopPublishers,
  shopCustomTemplates,
  shopCustomLogos,
  shopBannerAssignments,
};

function createDatabase() {
  const { url, authToken } = getTursoConfig();
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

function getDatabase(): Database {
  if (!database) {
    database = createDatabase();
  }

  return database;
}

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    const value = Reflect.get(getDatabase(), property, receiver);
    if (typeof value === "function") {
      return value.bind(getDatabase());
    }

    return value;
  },
});
