import type { GraphNode } from "@/types/graph";

type NodeMetadataCardProps = {
  node: GraphNode | null;
  isLoading?: boolean;
};

export default function NodeMetadataCard({
  node,
  isLoading = false,
}: NodeMetadataCardProps) {
  const backgroundImage = node?.imageUrl
    ? `linear-gradient(rgba(17, 17, 17, 0.95), rgba(17, 17, 17, 0.95)), url(${node.imageUrl})`
    : undefined;

  return (
    <aside
      className="absolute w-full max-w-xs rounded-lg border border-[#2b2b2b] bg-[#111111]/95 bg-cover bg-center p-4 text-sm text-[#f2eee6] shadow-sm backdrop-blur"
      style={{ backgroundImage, backgroundBlendMode: "hard-light" }}
    >
      <h2 className="mb-3 text-base font-semibold">Node details</h2>
      {isLoading ? (
        <p className="mb-3 text-xs uppercase tracking-wide text-[#b8b1a5]">
          Loading related nodes...
        </p>
      ) : null}
      {node ? (
        <dl className="space-y-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#b8b1a5]">Label</dt>
            <dd>{node.label ?? "Unknown"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#b8b1a5]">Type</dt>
            <dd>{node.type ?? "Unknown"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#b8b1a5]">ID</dt>
            <dd className="break-all">{node.id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#b8b1a5]">Extra</dt>
            <dd>{node.sublabel ?? "None"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#b8b1a5]">URL</dt>
            <dd className="break-all"><a href={node.url ?? "#"} target="_blank" rel="noopener noreferrer">{node.url ?? "None"}</a></dd>
          </div>
        </dl>
      ) : (
        <p className="text-[#b8b1a5]">Click a node to inspect its metadata.</p>
      )}
    </aside>
  );
}
