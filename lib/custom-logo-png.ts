import { MAX_CUSTOM_LOGO_SVG_LENGTH } from "@/lib/presswall-validation";

export const CUSTOM_LOGO_PNG_ACCEPT = "image/png";
export const CUSTOM_LOGO_MAX_INPUT_BYTES = 2 * 1024 * 1024;
export const CUSTOM_LOGO_MAX_WIDTH = 400;

export class CustomLogoPngError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomLogoPngError";
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new CustomLogoPngError("Could not read that PNG. Try another file.")
      );
    };

    image.src = objectUrl;
  });
}

function buildLogoSvg(dataUrl: string, width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/></svg>`;
}

function renderPngDataUrl(
  image: HTMLImageElement,
  targetWidth: number
): { dataUrl: string; height: number; width: number } {
  const scale = Math.min(1, targetWidth / image.naturalWidth);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new CustomLogoPngError("Could not process that PNG in this browser.");
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width,
    height,
  };
}

export async function pngFileToLogoSvg(file: File): Promise<string> {
  if (file.type !== CUSTOM_LOGO_PNG_ACCEPT) {
    throw new CustomLogoPngError(
      "Upload a PNG file with a transparent background."
    );
  }

  if (file.size > CUSTOM_LOGO_MAX_INPUT_BYTES) {
    throw new CustomLogoPngError("PNG must be 2 MB or smaller.");
  }

  const image = await loadImageFromFile(file);

  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    throw new CustomLogoPngError("That PNG looks empty. Try another file.");
  }

  let targetWidth = Math.min(image.naturalWidth, CUSTOM_LOGO_MAX_WIDTH);

  while (targetWidth >= 64) {
    const rendered = renderPngDataUrl(image, targetWidth);
    const svg = buildLogoSvg(rendered.dataUrl, rendered.width, rendered.height);

    if (svg.length <= MAX_CUSTOM_LOGO_SVG_LENGTH) {
      return svg;
    }

    targetWidth = Math.floor(targetWidth * 0.8);
  }

  throw new CustomLogoPngError(
    "That PNG is too large. Use a smaller or simpler transparent logo."
  );
}

export function readPngPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
