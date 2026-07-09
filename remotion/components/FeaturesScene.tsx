import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GEIST_FONT } from "../fonts";
import { FEATURES } from "../template-data";

const STEP_STAGGER = 14;

export function FeaturesScene({
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

  const headerOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        fontFamily: GEIST_FONT,
        opacity: fadeIn * fadeOut,
        padding: "0 100px",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "#888",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.18em",
            margin: "0 0 16px",
            opacity: headerOpacity,
            textTransform: "uppercase",
          }}
        >
          How it works
        </p>
        <h2
          style={{
            color: "#111",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "0 0 56px",
            opacity: headerOpacity,
          }}
        >
          Live in three simple steps
        </h2>

        <div
          style={{
            display: "flex",
            gap: 28,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {FEATURES.map((feature, index) => {
            const enter = 10 + index * STEP_STAGGER;
            const cardSpring = spring({
              fps,
              frame: frame - enter,
              config: { damping: 14, mass: 0.45, stiffness: 180 },
            });
            const cardOpacity = interpolate(frame, [enter, enter + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(cardSpring, [0, 1], [36, 0]);

            return (
              <div
                key={feature.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #ebebeb",
                  borderRadius: 20,
                  boxShadow: "0 18px 50px rgba(0,0,0,0.06)",
                  flex: 1,
                  maxWidth: 360,
                  opacity: cardOpacity,
                  padding: "40px 32px",
                  transform: `translateY(${y}px) scale(${0.94 + cardSpring * 0.06})`,
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    background: "#111",
                    borderRadius: 999,
                    color: "#fff",
                    display: "flex",
                    fontSize: 18,
                    fontWeight: 700,
                    height: 40,
                    justifyContent: "center",
                    marginBottom: 24,
                    width: 40,
                  }}
                >
                  {index + 1}
                </div>
                <h3
                  style={{
                    color: "#111",
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: "0 0 12px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "#666",
                    fontSize: 20,
                    fontWeight: 400,
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}
