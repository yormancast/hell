'use client';

import { useEffect } from "react";

import type { DiscoveryResponse } from "@/types/music";

type DiscoveryLoggerProps = {
  discovery: DiscoveryResponse;
};

export default function DiscoveryLogger({ discovery }: DiscoveryLoggerProps) {
  useEffect(() => {
    console.log("discovery", discovery);
  }, [discovery]);

  return null;
}
