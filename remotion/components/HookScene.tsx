import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GEIST_FONT } from "../fonts";

/**
 * Opening beat — quiet, single message. No marquee / logo wall.
 */
export function HookScene({
  durationInFrames,
}: {
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 16, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleScale = spring({
    fps,
    frame: frame - 4,
    config: { damping: 16, mass: 0.45, stiffness: 140 },
  });

  const titleOpacity = interpolate(frame, [4, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(frame, [28, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subY = interpolate(frame, [28, 46], [12, 0], {
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
        padding: "0 120px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          fontSize: 76,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          lineHeight: 1.1,
          margin: 0,
          maxWidth: 1000,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        Shoppers trust brands
        <br />
        they&rsquo;ve seen in the press
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 28,
          fontWeight: 400,
          margin: "28px 0 0",
          maxWidth: 640,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        Put that trust on your Shopify storefront
      </p>
    </AbsoluteFill>
  );
}
