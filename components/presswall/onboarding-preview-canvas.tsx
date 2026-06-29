"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type NodeProps,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { memo, useEffect } from "react";
import { OnboardingPreview } from "@/components/presswall/onboarding-preview";
import type {
  PresswallConfig,
  PublisherCatalogItem,
  ShopPublisherSelection,
} from "@/lib/presswall-types";
import { cn } from "@/lib/utils";

import "@xyflow/react/dist/style.css";

const PREVIEW_NODE_ID = "presswall-preview";

type DeviceMode = "desktop" | "mobile";

interface PresswallPreviewNodeData extends Record<string, unknown> {
  catalog: PublisherCatalogItem[];
  config: PresswallConfig;
  deviceMode: DeviceMode;
  previewTheme: "light" | "dark";
  selections: ShopPublisherSelection[];
}

type PresswallPreviewNode = Node<PresswallPreviewNodeData, "presswallPreview">;

const nodeTypes = {
  presswallPreview: memo(function PresswallPreviewNode({
    data,
  }: NodeProps<PresswallPreviewNode>) {
    const width = data.deviceMode === "mobile" ? 280 : 680;

    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl bg-background shadow-sm ring-1 ring-border/60",
          data.deviceMode === "mobile" && "rounded-[1.25rem]"
        )}
        style={{ width }}
      >
        <OnboardingPreview
          catalog={data.catalog}
          className="border-0 shadow-none"
          config={data.config}
          previewTheme={data.previewTheme}
          scale="lg"
          selections={data.selections}
        />
      </div>
    );
  }),
};

function createPreviewNode(
  data: PresswallPreviewNodeData
): PresswallPreviewNode {
  return {
    id: PREVIEW_NODE_ID,
    type: "presswallPreview",
    position: { x: 0, y: 0 },
    data,
    draggable: true,
    selectable: true,
  };
}

interface OnboardingPreviewCanvasProps {
  catalog: PublisherCatalogItem[];
  config: PresswallConfig;
  deviceMode: DeviceMode;
  previewTheme: "light" | "dark";
  selections: ShopPublisherSelection[];
}

function OnboardingPreviewCanvasInner({
  catalog,
  config,
  deviceMode,
  previewTheme,
  selections,
}: OnboardingPreviewCanvasProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<PresswallPreviewNode>([
    createPreviewNode({
      catalog,
      config,
      deviceMode,
      previewTheme,
      selections,
    }),
  ]);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) =>
        node.id === PREVIEW_NODE_ID
          ? {
              ...node,
              data: { catalog, config, deviceMode, previewTheme, selections },
            }
          : node
      )
    );
  }, [catalog, config, deviceMode, previewTheme, selections, setNodes]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when preview frame width changes
  useEffect(() => {
    fitView({ padding: 0.28, duration: 250 });
  }, [deviceMode, fitView]);

  return (
    <ReactFlow
      className="bg-muted/35"
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      deleteKeyCode={null}
      edges={[]}
      elementsSelectable={false}
      maxZoom={2}
      minZoom={0.35}
      nodes={nodes}
      nodesConnectable={false}
      nodesDraggable
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      panOnDrag
      proOptions={{ hideAttribution: true }}
      zoomOnDoubleClick={false}
      zoomOnPinch
      zoomOnScroll
    >
      <Background gap={18} size={1} variant={BackgroundVariant.Dots} />
      <Controls showInteractive={false} />
      <Panel
        className="rounded-md border bg-background/90 px-2.5 py-1 text-[0.625rem] text-muted-foreground shadow-sm backdrop-blur-sm"
        position="top-left"
      >
        Drag to move · scroll to zoom
      </Panel>
    </ReactFlow>
  );
}

export function OnboardingPreviewCanvas(props: OnboardingPreviewCanvasProps) {
  return (
    <ReactFlowProvider>
      <OnboardingPreviewCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
