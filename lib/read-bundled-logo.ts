import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  BUNDLED_LOGO_EXTENSIONS,
  isBundledPublisherId,
} from "@/lib/bundled-publishers";

const LOGO_DIR = path.join(process.cwd(), "public/publishers/logos");

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export async function readBundledPublisherLogo(publisherId: string) {
  if (!isBundledPublisherId(publisherId)) {
    return null;
  }

  for (const extension of BUNDLED_LOGO_EXTENSIONS) {
    const filePath = path.join(LOGO_DIR, `${publisherId}${extension}`);

    try {
      const data = await readFile(filePath);
      return {
        body: data,
        contentType: MIME_TYPES[extension] ?? "application/octet-stream",
        extension,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  return null;
}
