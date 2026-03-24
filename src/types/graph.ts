export type GraphNode = {
  id: string;
  type: string;
  label: string;
  sublabel?: string | null;
  url?: string | null;
  imageUrl?: string | null;
};

export type PositionedGraphNode = GraphNode & {
  x?: number;
  y?: number;
  z?: number;
};

export type GraphLink = {
  source: string;
  target: string;
  relationship?: string;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
  centerNode: GraphNode | null;
};
