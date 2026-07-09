import { Img, staticFile } from "remotion";

/**
 * Solid mark assets (matches app icon / listing artwork):
 * - light → white logo on black square (dark backgrounds)
 * - dark  → black logo on white square (light backgrounds)
 */
type LogoVariant = "dark" | "light";

const LOGO_SRC: Record<LogoVariant, string> = {
  dark: "brand/white-back.png",
  light: "brand/black-back.png",
};

export function OfficialLogo({
  height = 120,
  variant = "dark",
}: {
  height?: number;
  variant?: LogoVariant;
}) {
  return (
    <Img
      src={staticFile(LOGO_SRC[variant])}
      style={{
        borderRadius: Math.round(height * 0.18),
        height,
        objectFit: "contain",
        width: height,
      }}
    />
  );
}
