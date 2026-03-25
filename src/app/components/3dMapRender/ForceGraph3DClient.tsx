"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildGraphData } from "@/app/libs/graph";
import type { GraphData, GraphNode, PositionedGraphNode } from "@/types/graph";
import type { DiscoveryResponse } from "@/types/music";
import NodeMetadataCard from "./NodeMetadataCard";

type ForceGraph3DClientProps = {
  graphData: GraphData;
};

const TYPE_COLORS: Record<string, string> = {
  artist: "#edae49",
  album: "#92140c",
  tag: "#00798c",
};

function getNodeColor(type?: string) {
  return TYPE_COLORS[type ?? ""] ?? "#a3a3a3";
}

export default function ForceGraph3DClient({
  graphData,
}: ForceGraph3DClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<any>(null);
  const [currentGraphData, setCurrentGraphData] = useState(graphData);
  const [centerNode, setCenterNode] = useState<GraphNode | null>(graphData.centerNode);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentGraphData(graphData);
    setCenterNode(graphData.centerNode);
  }, [graphData]);

  const handleNodeClick = useCallback(async (node: GraphNode) => {
    setCenterNode(node);

    if (!node.type || !node.label || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/discovery?type=${node.type}&value=${encodeURIComponent(node.label)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load node discovery data.");
      }

      const discovery = (await response.json()) as DiscoveryResponse;
      const nextGraphData = buildGraphData(discovery);

      setCurrentGraphData(nextGraphData);
      setCenterNode(nextGraphData.centerNode);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const focusCamera = useCallback(() => {
    const graphInstance = graphRef.current;

    if (!graphInstance) {
      return;
    }

    const positionedCenterNode = currentGraphData.nodes.find(
      (node) => node.id === centerNode?.id,
    ) as PositionedGraphNode | undefined;

    const target = {
      x: positionedCenterNode?.x ?? 0,
      y: positionedCenterNode?.y ?? 0,
      z: positionedCenterNode?.z ?? 0,
    };

    graphInstance.cameraPosition(
      {
        x: target.x,
        y: target.y,
        z: target.z + 500,
      },
      target,
      700,
    );
  }, [centerNode?.id, currentGraphData.nodes]);

  useEffect(() => {
    async function renderGraph() {
      const containerElement = containerRef.current;

      if (!containerElement) return;

      const ForceGraph3D = (await import("3d-force-graph")).default;
      const THREE = require("three");
      const graphInstance =
        graphRef.current ??
        new ForceGraph3D(containerElement);

      graphRef.current = graphInstance;

      const chargeForce = graphInstance.d3Force("charge");
      const linkForce = graphInstance.d3Force("link");

      chargeForce?.strength?.(-280);
      linkForce?.distance?.(120);

      graphInstance
        .width(containerElement.clientWidth)
        .height(containerElement.clientHeight)
        .linkColor(() => "rgba(255, 255, 255, 0.22)")
        .linkOpacity(0.35)
        .linkWidth(1.2)
        .nodeLabel((node: GraphNode) => {
          return node.label;
        })
        .nodeThreeObject((node: GraphNode) => { 
          const isCenterNode = centerNode?.id === node.id;
          const color = getNodeColor(node.type);
          const radius = isCenterNode ? 9 : 5;
          const group = new THREE.Group();
          const glow = new THREE.Mesh(
            new THREE.SphereGeometry(radius * (isCenterNode ? 1.8 : 1.45), 24, 24),
            new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: isCenterNode ? 0.14 : 0.08,
            }),
          );
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 28, 28),
            new THREE.MeshStandardMaterial({
              color,
              emissive: color,
              emissiveIntensity: isCenterNode ? 0.65 : 0.25,
              roughness: isCenterNode ? 0.25 : 0.35,
              metalness: isCenterNode ? 0.18 : 0.08,
            }),
          );

          group.add(glow);
          group.add(core);

          if (isCenterNode) {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(radius + 5, 0.75, 16, 64),
              new THREE.MeshBasicMaterial({
                color: "#f2eee6",
                transparent: true,
                opacity: 0.75,
              }),
            );

            ring.rotation.x = Math.PI / 2;
            group.add(ring);
          }

          return group;
        })
        .nodeThreeObjectExtend(true)
        .onNodeClick((node: GraphNode) => {

          void handleNodeClick(node);
        })
        .graphData(currentGraphData)
        .refresh();

      window.setTimeout(focusCamera, 300);
    }

    void renderGraph();

    const containerElement = containerRef.current;

    return () => {
      graphRef.current = null;
      containerElement?.replaceChildren();
    };
  }, [centerNode, currentGraphData, focusCamera, handleNodeClick]);

  return (
    <div className="flex items-start gap-4">
      <div ref={containerRef} className="h-[70vh] flex-1" />
      <NodeMetadataCard node={centerNode} isLoading={isLoading} />
    </div>
  );
}
