import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GEIST_FONT } from "../fonts";
import { OfficialLogo } from "./OfficialLogo";

export function CtaScreen({
  durationInFrames,
}: {
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = spring({
    fps,
    frame,
    config: { damping: 12, mass: 0.35, stiffness: 200 },
  });

  const headlineOpacity = interpolate(frame, [10, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineY = interpolate(frame, [10, 24], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [22, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaSpring = spring({
    fps,
    frame: frame - 32,
    config: { damping: 12, mass: 0.35, stiffness: 220 },
  });

  // Subtle pulse on the CTA button
  const pulse = 1 + Math.sin((frame - 50) * 0.08) * 0.015;
  const ctaScale = Math.max(0, ctaSpring) * (frame > 50 ? pulse : 1);

  const featuresOpacity = interpolate(frame, [48, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Soft radial glow behind content
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        fontFamily: GEIST_FONT,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 48%, rgba(80,80,90,0.45) 0%, transparent 70%)",
          height: "100%",
          left: 0,
          opacity: glowOpacity,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />

      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "0 80px",
          position: "relative",
          textAlign: "center",
        }}
      >
        <div style={{ transform: `scale(${logoScale})` }}>
          <OfficialLogo height={110} variant="light" />
        </div>

        <h2
          style={{
            color: "#ffffff",
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            margin: "36px 0 18px",
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
          }}
        >
          Build trust on your storefront
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 40px",
            maxWidth: 700,
            opacity: subtitleOpacity,
          }}
        >
          Install Presswall free from the Shopify App Store
        </p>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(255,255,255,0.12)",
            color: "#111",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            marginBottom: 52,
            padding: "20px 48px",
            transform: `scale(${ctaScale})`,
          }}
        >
          Get started free
        </div>

        <div
          style={{
            alignItems: "center",
            color: "rgba(255,255,255,0.42)",
            display: "flex",
            fontSize: 17,
            fontWeight: 500,
            gap: 28,
            letterSpacing: "0.04em",
            opacity: featuresOpacity,
          }}
        >
          <span>90+ publishers</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>4 templates</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Theme app embed</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Fully customizable</span>
        </div>

        {/* Hold last frames: quiet end card */}
        <p
          style={{
            bottom: 48,
            color: "rgba(255,255,255,0.28)",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "0.08em",
            margin: 0,
            opacity: interpolate(
              frame,
              [durationInFrames - 60, durationInFrames - 40],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
            position: "absolute",
            textTransform: "uppercase",
          }}
        >
          presswall.noxify.io
        </p>
      </div>
    </AbsoluteFill>
  );
}
