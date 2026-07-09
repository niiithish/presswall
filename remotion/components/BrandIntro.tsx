import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GEIST_FONT } from "../fonts";
import { OfficialLogo } from "./OfficialLogo";

export function BrandIntro({
  durationInFrames,
}: {
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const logoScale = spring({
    fps,
    frame,
    config: { damping: 12, mass: 0.4, stiffness: 200 },
  });

  const nameOpacity = interpolate(frame, [12, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameY = interpolate(frame, [12, 26], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tagOpacity = interpolate(frame, [28, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [22, 40], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        fontFamily: GEIST_FONT,
        justifyContent: "center",
        opacity: fadeIn * fadeOut,
      }}
    >
      <div style={{ transform: `scale(${logoScale})` }}>
        {/* Solid white mark on black — matches listing / app icon */}
        <OfficialLogo height={180} variant="light" />
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.35)",
          height: 2,
          marginTop: 32,
          opacity: nameOpacity,
          width: lineWidth,
        }}
      />

      <h2
        style={{
          color: "#ffffff",
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "24px 0 0",
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
        }}
      >
        Presswall
      </h2>

      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 26,
          fontWeight: 500,
          margin: "14px 0 0",
          opacity: tagOpacity,
        }}
      >
        &ldquo;As seen on&rdquo; press strips for Shopify
      </p>
    </AbsoluteFill>
  );
}
