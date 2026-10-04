"use client"

import type { TableOfContentsEntry } from "notion-utils";
import { useActiveHeading, useMediaQuery } from "./use-active-heading";
import { DesktopTOC } from "./desktop-toc";

interface TableOfContentsProps {
  toc: TableOfContentsEntry[];
  type: "Tweet" | "Article";
}

/**
 * Main Table of Contents component
 * Conditionally renders desktop or mobile version based on screen size
 */
export function TableOfContents({ toc, type }: TableOfContentsProps) {
  // Early return for invalid cases
  if (!toc || toc.length === 0 || type === "Tweet") {
    return null;
  }

  // Detect device type using md breakpoint (768px)
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Track active heading based on scroll position
  const { activeHeadingId, activeHeadingPath, handleHeadingClick } = useActiveHeading(toc);

  return (
    <>
      {isDesktop ? (
        <DesktopTOC
          toc={toc}
          activeHeadingId={activeHeadingId}
          activeHeadingPath={activeHeadingPath}
          onHeadingClick={handleHeadingClick}
        />
      ) : null}
    </>
  );
}
