import { useState, useEffect, useRef } from "react";
import type { TableOfContentsEntry } from "notion-utils";
import { buildHeadingTree, findNodeById, getHeadingPath, uuidToId } from "./heading-tree";

/**
 * Custom hook to track the currently active heading based on scroll position
 * Uses Intersection Observer API to detect which heading is currently visible
 * @param toc - Array of table of contents entries
 * @returns Object containing active heading ID and its path from root
 */
export function useActiveHeading(toc: TableOfContentsEntry[]) {
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
export function useMediaQuery(query: string): boolean {
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
