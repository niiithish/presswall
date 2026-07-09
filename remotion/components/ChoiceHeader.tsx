import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GEIST_FONT } from "../fonts";

export function ChoiceHeader({
  durationInFrames,
}: {
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleScale = spring({
    fps,
    frame,
    config: { damping: 12, mass: 0.35, stiffness: 220 },
  });

  const subtitleOpacity = interpolate(frame, [16, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        fontFamily: GEIST_FONT,
        height: "100%",
        justifyContent: "center",
        opacity,
        padding: "0 80px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "#888",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "0.18em",
          margin: "0 0 20px",
          textTransform: "uppercase",
        }}
      >
        Start in seconds
      </p>
      <h2
        style={{
          color: "#111",
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          margin: "0 0 20px",
          transform: `scale(${titleScale})`,
        }}
      >
        4 ready-made templates
      </h2>
      <p
        style={{
          color: "#555",
          fontSize: 30,
          fontWeight: 500,
          margin: 0,
          opacity: subtitleOpacity,
        }}
      >
        — or build a fully custom strip —
      </p>
    </div>
  );
}
