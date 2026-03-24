import type { GraphData } from "@/types/graph";
import type { DiscoveryResponse } from "@/types/music";

export function buildGraphData(discovery: DiscoveryResponse): GraphData {
  const nodes = discovery.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    label: node.label,
    sublabel: node.sublabel,
    url: node.url,
    imageUrl: node.imageUrl,
  }));

  return {
    nodes,
    links: discovery.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      relationship: edge.relationship,
    })),
    centerNode: nodes.find((node) => node.id === discovery.center) ?? null,
  };
}
