"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type NodeProps,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { OnboardingPreview } from "@/components/presswall/onboarding-preview";
import { PreviewLogoStyleToggle } from "@/components/presswall/preview-logo-style-toggle";
import { getPreviewViewportWidth } from "@/lib/presswall-preview-viewport";
import type {
  PresswallConfig,
  PublisherCatalogItem,
  ShopCustomLogo,
  ShopPublisherSelection,
} from "@/lib/presswall-types";

import "@xyflow/react/dist/style.css";

type DeviceMode = "desktop" | "mobile";

interface OnboardingPreviewCanvasProps {
  catalog: PublisherCatalogItem[];
  config: PresswallConfig;
  customLogos?: ShopCustomLogo[];
  deviceMode: DeviceMode;
  /** When set, shows Color / Black / White in the canvas corner. */
  onColorModeChange?: (value: PresswallConfig["colorMode"]) => void;
  /** Editor: hover a logo → change control opens the replace picker. */
  onReplaceLogoAt?: (selectionIndex: number) => void;
  selections: ShopPublisherSelection[];
  showViewportHint?: boolean;
}

/**
 * Live preview content is read from context so React Flow's `nodes` array stays
 * referentially stable while sliders (heading spacing, gaps, etc.) update.
 *
 * Replacing the `nodes` prop on every config tick forces xyflow to drop
 * measured node dimensions and re-measure — that is the live-preview flicker.
 */
interface PreviewFlowContent {
  catalog: PublisherCatalogItem[];
  config: PresswallConfig;
  customLogos?: ShopCustomLogo[];
  deviceMode: DeviceMode;
  onReplaceLogoAt?: (selectionIndex: number) => void;
  selections: ShopPublisherSelection[];
}

const PreviewFlowContentContext = createContext<PreviewFlowContent | null>(
  null
);

interface PreviewNodeData extends Record<string, unknown> {
  viewportWidth: number;
}

const PREVIEW_NODE_ID = "presswall-preview";
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.5;
const FIT_PADDING = 0.18;
const FIT_VIEW_OPTIONS = {
  padding: FIT_PADDING,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
} as const;

function usePreviewFlowContent(): PreviewFlowContent {
  const content = useContext(PreviewFlowContentContext);
  if (!content) {
    throw new Error(
      "Preview node must render inside PreviewFlowContentContext"
    );
  }
  return content;
}

function PreviewStripNode({ data }: NodeProps<Node<PreviewNodeData>>) {
  const {
    catalog,
    config,
    customLogos,
    deviceMode,
    onReplaceLogoAt,
    selections,
  } = usePreviewFlowContent();

  return (
    <div
      className={
        onReplaceLogoAt ? "select-none" : "pointer-events-none select-none"
      }
      style={{ width: data.viewportWidth }}
    >
      <OnboardingPreview
        catalog={catalog}
        className="border-black/10 shadow-sm"
        config={config}
        customLogos={customLogos}
        deviceMode={deviceMode}
        onReplaceLogoAt={onReplaceLogoAt}
        scale="lg"
        selections={selections}
      />
    </div>
  );
}

const nodeTypes = {
  preview: PreviewStripNode,
};

function PreviewCanvasFlow({
  catalog,
  config,
  customLogos,
  deviceMode,
  onReplaceLogoAt,
  selections,
}: Omit<
  OnboardingPreviewCanvasProps,
  "onColorModeChange" | "showViewportHint"
>) {
  const { fitView } = useReactFlow();
  const viewportWidth = getPreviewViewportWidth(deviceMode);
  const hasFittedRef = useRef(false);

  const content = useMemo<PreviewFlowContent>(
    () => ({
      catalog,
      config,
      customLogos,
      deviceMode,
      onReplaceLogoAt,
      selections,
    }),
    [catalog, config, customLogos, deviceMode, onReplaceLogoAt, selections]
  );

  // Stable node identity — only rebuild when viewport width changes.
  const nodes = useMemo<Node<PreviewNodeData>[]>(
    () => [
      {
        id: PREVIEW_NODE_ID,
        type: "preview",
        position: { x: 0, y: 0 },
        data: { viewportWidth },
        draggable: false,
        selectable: false,
        focusable: false,
      },
    ],
    [viewportWidth]
  );

  useEffect(() => {
    // Re-fit when the frame width changes (desktop ↔ mobile). Do not depend on
    // strip config — that was recreating RF nodes and flashing measured size.
    const frameWidth = viewportWidth;
    const animate = hasFittedRef.current;
    const timer = window.setTimeout(() => {
      if (frameWidth <= 0) {
        return;
      }

      fitView({
        ...FIT_VIEW_OPTIONS,
        duration: animate ? 200 : 0,
      });
      hasFittedRef.current = true;
    }, 50);

    return () => window.clearTimeout(timer);
  }, [viewportWidth, fitView]);

  return (
    <PreviewFlowContentContext.Provider value={content}>
      <ReactFlow
        className="presswall-preview-flow h-full w-full"
        colorMode="light"
        defaultEdgeOptions={{ hidden: true }}
        deleteKeyCode={null}
        elementsSelectable={false}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        multiSelectionKeyCode={null}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodeTypes={nodeTypes}
        panOnDrag
        panOnScroll={false}
        preventScrolling
        proOptions={{ hideAttribution: true }}
        selectionKeyCode={null}
        zoomOnDoubleClick
        zoomOnPinch
        zoomOnScroll
      >
        {/* Built-in React Flow dotted canvas (pans/zooms with the viewport). */}
        <Background
          bgColor="#f4f4f5"
          color="#a1a1aa"
          gap={16}
          size={1.5}
          variant={BackgroundVariant.Dots}
        />
        <Controls
          className="presswall-preview-flow-controls overflow-hidden rounded-md border bg-background/95 shadow-sm"
          fitViewOptions={FIT_VIEW_OPTIONS}
          position="bottom-right"
          showInteractive={false}
        />
      </ReactFlow>
    </PreviewFlowContentContext.Provider>
  );
}

export function OnboardingPreviewCanvas({
  onColorModeChange,
  showViewportHint = true,
  ...props
}: OnboardingPreviewCanvasProps) {
  const viewportWidth = getPreviewViewportWidth(props.deviceMode);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ReactFlowProvider>
        <PreviewCanvasFlow {...props} />
      </ReactFlowProvider>

      {showViewportHint ? (
        <p className="pointer-events-none absolute top-3 left-3 z-10 rounded-md border bg-background/90 px-2.5 py-1 text-[0.625rem] text-muted-foreground shadow-sm backdrop-blur-sm">
          {props.deviceMode === "desktop" ? "Desktop" : "Mobile"} ·{" "}
          {viewportWidth}px
        </p>
      ) : null}

      {onColorModeChange ? (
        <div className="absolute bottom-3 left-3 z-10">
          <PreviewLogoStyleToggle
            onChange={onColorModeChange}
            value={props.config.colorMode}
          />
        </div>
      ) : null}
    </div>
  );
}
