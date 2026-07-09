import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GEIST_FONT } from "../fonts";
import { DASHBOARD_VIDEO, DASHBOARD_VIDEO_FRAMES } from "../video-config";

/**
 * Must be rendered inside a <Sequence from={…} durationInFrames={…}> so
 * OffthreadVideo starts at frame 0 of the source, not the global timeline.
 */
export function DashboardClip() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOpacity = interpolate(
    frame,
    [0, 14, DASHBOARD_VIDEO_FRAMES - 12, DASHBOARD_VIDEO_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleOpacity = interpolate(frame, [0, 50, 90], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleScale = spring({
    fps,
    frame,
    config: { damping: 12, mass: 0.35, stiffness: 220 },
  });

  const frameScale = interpolate(frame, [6, 22], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shrink the header once the title fades so the video fills more of the frame
  const headerSpace = interpolate(frame, [70, 100], [148, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: "#f4f4f5",
        display: "flex",
        flexDirection: "column",
        fontFamily: GEIST_FONT,
        justifyContent: "center",
        opacity: sceneOpacity,
        padding: "40px 72px 48px",
      }}
    >
      <div
        style={{
          height: headerSpace,
          marginBottom: 8,
          opacity: titleOpacity,
          overflow: "hidden",
          textAlign: "center",
          transform: `scale(${titleScale})`,
          width: "100%",
        }}
      >
        <p
          style={{
            color: "#888",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.16em",
            margin: "0 0 10px",
            textTransform: "uppercase",
          }}
        >
          Inside the app
        </p>
        <h2
          style={{
            color: "#111",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          Design your press strip
        </h2>
        <p
          style={{
            color: "#666",
            fontSize: 22,
            fontWeight: 400,
            margin: "10px 0 0",
          }}
        >
          Outlets, layouts, colors — preview as you go
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e2e2",
          borderRadius: 18,
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.04), 0 32px 90px rgba(0,0,0,0.14)",
          flex: 1,
          maxHeight: 820,
          maxWidth: 1380,
          minHeight: 0,
          overflow: "hidden",
          transform: `scale(${frameScale})`,
          width: "100%",
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            alignItems: "center",
            background: "linear-gradient(180deg, #f8f8f8 0%, #f0f0f0 100%)",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            gap: 10,
            padding: "14px 18px",
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            <span
              style={{
                background: "#ff5f57",
                borderRadius: "50%",
                display: "block",
                height: 12,
                width: 12,
              }}
            />
            <span
              style={{
                background: "#febc2e",
                borderRadius: "50%",
                display: "block",
                height: 12,
                width: 12,
              }}
            />
            <span
              style={{
                background: "#28c840",
                borderRadius: "50%",
                display: "block",
                height: 12,
                width: 12,
              }}
            />
          </div>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              color: "#777",
              flex: 1,
              fontSize: 13,
              fontWeight: 500,
              marginLeft: 8,
              maxWidth: 520,
              overflow: "hidden",
              padding: "6px 14px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            admin.shopify.com · Presswall
          </div>
        </div>

        <OffthreadVideo
          muted
          src={staticFile(DASHBOARD_VIDEO)}
          style={{
            background: "#fafafa",
            display: "block",
            height: "calc(100% - 48px)",
            objectFit: "cover",
            objectPosition: "top center",
            width: "100%",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}
