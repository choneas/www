"use client"

import { useState, useEffect, useRef } from "react";
import { ScrollShadow } from "@heroui/react";
import { useTranslations } from "next-intl";
import type { TableOfContentsEntry } from "notion-utils";

interface TableOfContentsProps {
  toc: TableOfContentsEntry[];
  type: "Tweet" | "Article";
}

/**
 * Heading node in the tree structure
 * Represents a heading with parent-child relationships
 */
interface HeadingNode {
  id: string;
  text: string;
  indentLevel: 0 | 1 | 2;
  parent: HeadingNode | null;
  children: HeadingNode[];
}

/**
 * Build heading tree structure from flat TOC array
 * Creates parent-child relationships based on indentLevel
 * @param toc - Flat array of table of contents entries
 * @returns Array of root heading nodes
 */
function buildHeadingTree(toc: TableOfContentsEntry[]): HeadingNode[] {
  const roots: HeadingNode[] = [];
  const stack: HeadingNode[] = [];

  for (const entry of toc) {
    const node: HeadingNode = {
      id: entry.id,
      text: entry.text,
      indentLevel: entry.indentLevel as 0 | 1 | 2,
      parent: null,
      children: []
    };

    // Find parent based on indentLevel
    // Pop nodes from stack until we find a node with smaller indentLevel
    while (stack.length > 0 && stack[stack.length - 1].indentLevel >= node.indentLevel) {
      stack.pop();
    }

    if (stack.length > 0) {
      // Current node is a child of the last node in stack
      node.parent = stack[stack.length - 1];
      stack[stack.length - 1].children.push(node);
    } else {
      // Current node is a root node
      roots.push(node);
    }

    stack.push(node);
  }

  return roots;
}

/**
 * Get the path from root to a specific heading node
 * Returns array of heading IDs from root to target node
 * @param node - Target heading node
 * @returns Array of heading IDs representing the path
 */
function getHeadingPath(node: HeadingNode): string[] {
  const path: string[] = [];
  let current: HeadingNode | null = node;

  while (current) {
    path.unshift(current.id);
    current = current.parent;
  }

  return path;
}

/**
 * Find a heading node by ID in the tree
 * @param roots - Array of root heading nodes
 * @param id - Target heading ID
 * @returns Heading node if found, null otherwise
 */
function findNodeById(roots: HeadingNode[], id: string): HeadingNode | null {
  for (const root of roots) {
    if (root.id === id) {
      return root;
    }

    // Search in children recursively
    const found = findNodeByIdRecursive(root.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Helper function to recursively search for a node by ID
 * @param nodes - Array of heading nodes to search
 * @param id - Target heading ID
 * @returns Heading node if found, null otherwise
 */
function findNodeByIdRecursive(nodes: HeadingNode[], id: string): HeadingNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const found = findNodeByIdRecursive(node.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Convert UUID format to DOM ID format
 * Removes hyphens from UUID (e.g., "29d9bcd3-09be-80c4-9425-e66fc12e424f" -> "29d9bcd309be80c49425e66fc12e424f")
 * @param uuid - UUID string with hyphens
 * @returns DOM ID string without hyphens
 */
function uuidToId(uuid: string): string {
  return uuid.replace(/-/g, "");
}

/**
 * Scroll to a heading element with smooth animation
 * Calculates offset to account for fixed navbar height
 * @param headingId - UUID format heading ID
 */
function scrollToHeading(headingId: string): void {
  // Convert UUID to DOM ID format
  const domId = uuidToId(headingId);
  const element = document.getElementById(domId);

  if (!element) {
    console.warn(`Heading element not found: ${headingId}`);
    return;
  }

  // Calculate navbar height and additional offset
  const navbarHeight = 64; // Navbar height in pixels
  const additionalOffset = 16; // Additional spacing
  const totalOffset = navbarHeight + additionalOffset;

  // Get element position
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - totalOffset;

  // Smooth scroll to position
  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}

/**
 * Custom hook to track the currently active heading based on scroll position
 * Uses Intersection Observer API to detect which heading is currently visible
 * @param toc - Array of table of contents entries
 * @returns Object containing active heading ID and its path from root
 */
function useActiveHeading(toc: TableOfContentsEntry[]) {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [activeHeadingPath, setActiveHeadingPath] = useState<string[]>([]);
  const [clickedHeadingId, setClickedHeadingId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supportsIntersectionObserver = typeof window !== "undefined" && "IntersectionObserver" in window;

  useEffect(() => {
    const headingTree = buildHeadingTree(toc);
    // Use Intersection Observer if supported
    if (supportsIntersectionObserver) {
      // Get all heading elements
      const headingElements = toc.map(entry => {
        const domId = uuidToId(entry.id);
        return document.getElementById(domId);
      }).filter(Boolean) as HTMLElement[];

      if (headingElements.length === 0) {
        return;
      }

      // Create Intersection Observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Find all visible headings
          const visibleEntries = entries.filter(entry => entry.isIntersecting);

          if (visibleEntries.length > 0) {
            // Sort by position in document (top to bottom)
            visibleEntries.sort((a, b) => {
              const rectA = a.target.getBoundingClientRect();
              const rectB = b.target.getBoundingClientRect();
              return rectA.top - rectB.top;
            });

            // Get the topmost visible heading
            const topmostEntry = visibleEntries[0];
            const headingId = topmostEntry.target.id;

            // Convert DOM ID back to UUID format
            const uuidId = toc.find(entry => uuidToId(entry.id) === headingId)?.id;

            if (uuidId) {
              // Only update if not recently clicked (avoid conflict)
              if (!clickedHeadingId || clickedHeadingId === uuidId) {
                setActiveHeadingId(uuidId);

                // Calculate heading path (includes parent headings)
                const node = findNodeById(headingTree, uuidId);
                if (node) {
                  setActiveHeadingPath(getHeadingPath(node));
                }
              }
            }
          }
        },
        {
          // Trigger when heading is in top 30% of viewport
          rootMargin: "-20% 0px -70% 0px",
          threshold: 0
        }
      );

      // Observe all heading elements
      headingElements.forEach(el => observerRef.current?.observe(el));

      // Cleanup
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    } else {
      // Fallback: use scroll event listener
      console.warn("IntersectionObserver not supported, falling back to scroll listener");

      const handleScroll = () => {
        const headingElements = toc.map(entry => {
          const domId = uuidToId(entry.id);
          return document.getElementById(domId);
        }).filter(Boolean) as HTMLElement[];

        // Find the first heading that is in the viewport
        for (const element of headingElements) {
          const rect = element.getBoundingClientRect();
          // Check if heading is in the top 30% of viewport
          if (rect.top >= 0 && rect.top <= window.innerHeight * 0.3) {
            const headingId = element.id;
            // Convert DOM ID back to UUID format
            const uuidId = toc.find(entry => uuidToId(entry.id) === headingId)?.id;

            if (uuidId && uuidId !== activeHeadingId) {
              setActiveHeadingId(uuidId);

              // Calculate heading path
              const node = findNodeById(headingTree, uuidId);
              if (node) {
                setActiveHeadingPath(getHeadingPath(node));
              }
            }
            break;
          }
        }
      };

      // Throttle scroll events
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const throttledScroll = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(handleScroll, 100);
      };

      window.addEventListener("scroll", throttledScroll);
      handleScroll(); // Initial check

      return () => {
        window.removeEventListener("scroll", throttledScroll);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [toc]);

  // Cleanup click timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleHeadingClick = (headingId: string) => {
    // Set clicked heading immediately
    setClickedHeadingId(headingId);
    setActiveHeadingId(headingId);

    // Calculate and set path
    const headingTree = buildHeadingTree(toc);
    const node = findNodeById(headingTree, headingId);
    if (node) {
      setActiveHeadingPath(getHeadingPath(node));
    }

    // Clear clicked state after scroll completes (1 second)
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickedHeadingId(null);
    }, 1000);
  };

  return { activeHeadingId, activeHeadingPath, handleHeadingClick };
}

/**
 * Custom hook to detect media query breakpoint
 * @param query - Media query string (e.g., "(min-width: 640px)")
 * @returns boolean indicating if the media query matches
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    media.addEventListener("change", listener);

    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// DOT configuration for desktop TOC
const DOT_CONFIG = {
  height: 3, // px - smaller height
  h1Width: 20, // px - H1 longest
  h2Width: 14, // px - H2 medium
  h3Width: 8, // px - H3 shortest
  marginRight: 8, // px - gap between DOT and text
};

/**
 * DOT indicator component for desktop TOC
 * Displays a continuous rounded rectangle bar for all headings
 * H1 has longest DOT, H2 medium, H3 shortest
 * All DOTs are left-aligned at the same position
 * @param indentLevel - Heading indent level (0/1/2)
 */
function DOTIndicator({ indentLevel }: { indentLevel: 0 | 1 | 2 }) {
  const widthMap = {
    0: DOT_CONFIG.h1Width,
    1: DOT_CONFIG.h2Width,
    2: DOT_CONFIG.h3Width
  };

  const width = widthMap[indentLevel];

  return (
    <div
      className="rounded-full shrink-0"
      style={{
        height: `${DOT_CONFIG.height}px`,
        width: `${width}px`,
        marginRight: `${DOT_CONFIG.marginRight}px`,
        backgroundColor: 'color-mix(in srgb, var(--color-foreground) 60%, transparent)'
      }}
    />
  );
}

/**
 * TOC Item component for desktop
 * Handles individual TOC item rendering with hover and active states
 */
interface TOCItemProps {
  entry: TableOfContentsEntry;
  isActive: boolean;
  isInActivePath: boolean;
  isParentHovered: boolean;
  isItemHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  itemRef?: React.RefObject<HTMLLIElement | null>;
}

function TOCItem({
  entry,
  isActive,
  isInActivePath,
  isParentHovered,
  isItemHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  itemRef
}: TOCItemProps) {
  // Calculate text color based on state priority:
  // 1. Active (current reading position): foreground/95
  // 2. Item hovered: foreground/90
  // 3. Parent (TOC container) hovered: foreground/80
  // 4. Default: foreground/70
  const getTextColor = () => {
    if (isActive || isInActivePath) {
      return 'color-mix(in srgb, var(--color-foreground) 95%, transparent)';
    }
    if (isItemHovered) {
      return 'color-mix(in srgb, var(--color-foreground) 90%, transparent)';
    }
    if (isParentHovered) {
      return 'color-mix(in srgb, var(--color-foreground) 80%, transparent)';
    }
    return 'color-mix(in srgb, var(--color-foreground) 70%, transparent)';
  };

  return (
    <li ref={itemRef}>
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="text-left w-full transition-colors flex items-center cursor-pointer"
        style={{
          color: getTextColor(),
          fontWeight: (isActive || isInActivePath) ? 500 : 400
        }}
        tabIndex={0}
        aria-current={isActive ? 'location' : undefined}
      >
        <DOTIndicator indentLevel={entry.indentLevel as 0 | 1 | 2} />
        <span className="truncate">{entry.text}</span>
      </button>
    </li>
  );
}

/**
 * Desktop Table of Contents component
 * Displays TOC in a fixed sidebar with DOT indent indicators
 * Implements hover states and auto-scroll to active item
 */
function DesktopTOC({
  toc,
  activeHeadingId,
  activeHeadingPath,
  onHeadingClick
}: {
  toc: TableOfContentsEntry[];
  activeHeadingId: string | null;
  activeHeadingPath: string[];
  onHeadingClick: (id: string) => void;
}) {
  const t = useTranslations("Table-Of-Contents");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  // Track article container right edge for positioning
  const [articleContainerRight, setArticleContainerRight] = useState(0);

  // Hover state management
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Measure article container position
  useEffect(() => {
    const updatePosition = () => {
      const articleContainer = document.querySelector('.notion');
      if (articleContainer) {
        const rect = articleContainer.getBoundingClientRect();
        setArticleContainerRight(rect.right);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  // Auto-scroll to active item when it changes
  useEffect(() => {
    if (!activeItemRef.current || !scrollContainerRef.current) return;

    const item = activeItemRef.current;
    const container = scrollContainerRef.current;

    const timeoutId = setTimeout(() => {
      const containerHeight = container.clientHeight;
      const itemTop = item.offsetTop;
      const itemHeight = item.offsetHeight;

      // Calculate scroll position to center the item
      const scrollCenter = itemTop - (containerHeight / 2) + (itemHeight / 2);

      container.scrollTo({
        top: Math.max(0, scrollCenter),
        behavior: 'smooth'
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activeHeadingId]);

  const handleClick = (headingId: string) => {
    onHeadingClick(headingId);
    scrollToHeading(headingId);
  };

  // Simplified positioning: fixed at right side of content, vertically centered
  const getPositionStyles = () => {
    const gap = 48; // 3rem gap from article container
    const leftPosition = articleContainerRight + gap;

    return {
      position: 'fixed' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      left: `${leftPosition}px`
    };
  };

  return (
    <nav
      role="navigation"
      aria-label={t("toc")}
      className="hidden md:block"
      style={getPositionStyles()}
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => {
        setIsContainerHovered(false);
        setHoveredItemId(null);
      }}
    >
      <div className="text-sm w-64">
        <ScrollShadow
          ref={scrollContainerRef}
          className="max-h-[40vh]"
          size={32}
          hideScrollBar
        >
          <ul className="space-y-2 py-1">
            {toc.map((entry) => {
              const isActive = activeHeadingId === entry.id;
              const isInActivePath = activeHeadingPath.includes(entry.id);
              const isItemHovered = hoveredItemId === entry.id;

              return (
                <TOCItem
                  key={entry.id}
                  entry={entry}
                  isActive={isActive}
                  isInActivePath={isInActivePath}
                  isParentHovered={isContainerHovered}
                  isItemHovered={isItemHovered}
                  onClick={() => handleClick(entry.id)}
                  onMouseEnter={() => setHoveredItemId(entry.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  itemRef={isActive ? activeItemRef : undefined}
                />
              );
            })}
          </ul>
        </ScrollShadow>
      </div>
    </nav>
  );
}

/**
 * TODO: Mobile Table of Contents component
 * Displays TOC as an island with expand/collapse functionality
 */
function MobileTOC({
  toc,
  activeHeadingId,
  activeHeadingPath
}: {
  toc: TableOfContentsEntry[];
  activeHeadingId: string | null;
  activeHeadingPath: string[];
}) {
  const t = useTranslations("Table-Of-Contents");

  const handleHeadingClick = (headingId: string) => {
    scrollToHeading(headingId);
  };

  return null

  return (
    <nav
      role="navigation"
      aria-label={t("toc")}
      className="md:hidden"
    >
      <div className="text-sm">
        {/* Placeholder for mobile TOC implementation */}
        <p className="text-foreground/70">Mobile TOC - To be implemented</p>
        <p className="text-foreground/50 text-xs mt-2">
          Active: {activeHeadingId || "None"}
        </p>
        <p className="text-foreground/50 text-xs">
          Path: {activeHeadingPath.length > 0 ? activeHeadingPath.join(" > ") : "None"}
        </p>

        {/* Temporary TOC list for testing scroll functionality */}
        <ul className="mt-4 space-y-2">
          {toc.map((entry) => (
            <li key={entry.id}>
              <button
                onClick={() => handleHeadingClick(entry.id)}
                className={`text-left w-full hover:text-foreground/90 transition-colors ${activeHeadingId === entry.id
                  ? "text-foreground/95 font-medium"
                  : "text-foreground/70"
                  }`}
                style={{ paddingLeft: `${(entry.indentLevel)}rem` }}
              >
                {entry.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
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
      ) : (
        <MobileTOC
          toc={toc}
          activeHeadingId={activeHeadingId}
          activeHeadingPath={activeHeadingPath}
        />
      )}
    </>
  );
}
