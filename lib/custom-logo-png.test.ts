import { describe, expect, test } from "bun:test";
import {
  CUSTOM_LOGO_MAX_INPUT_BYTES,
  CustomLogoPngError,
  pngFileToLogoSvg,
} from "@/lib/custom-logo-png";

describe("pngFileToLogoSvg", () => {
  test("rejects non-png mime types", async () => {
    const file = new File([new Uint8Array(8)], "logo.jpg", {
      type: "image/jpeg",
    });

    await expect(pngFileToLogoSvg(file)).rejects.toBeInstanceOf(
      CustomLogoPngError
    );
    await expect(pngFileToLogoSvg(file)).rejects.toThrow(
      "Upload a PNG file with a transparent background."
    );
  });

  test("rejects png files over 2 MB before decoding", async () => {
    const file = new File(
      [new Uint8Array(CUSTOM_LOGO_MAX_INPUT_BYTES + 1)],
      "large.png",
      { type: "image/png" }
    );

    await expect(pngFileToLogoSvg(file)).rejects.toThrow(
      "PNG must be 2 MB or smaller."
    );
  });
});
