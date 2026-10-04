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
    if (supportsIntersectionObserver) {
      const headingElements = toc.map(entry => {
        const domId = uuidToId(entry.id);
        return document.getElementById(domId);
      }).filter(Boolean) as HTMLElement[];

      if (headingElements.length === 0) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter(entry => entry.isIntersecting);

          if (visibleEntries.length > 0) {
            visibleEntries.sort((a, b) => {
              const rectA = a.target.getBoundingClientRect();
              const rectB = b.target.getBoundingClientRect();
              return rectA.top - rectB.top;
            });

            const topmostEntry = visibleEntries[0];
            const headingId = topmostEntry.target.id;

            // Convert DOM ID back to UUID format
            const uuidId = toc.find(entry => uuidToId(entry.id) === headingId)?.id;

            if (uuidId) {
              // Only update if not recently clicked (avoid conflict)
              if (!clickedHeadingId || clickedHeadingId === uuidId) {
                setActiveHeadingId(uuidId);

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

      headingElements.forEach(el => observerRef.current?.observe(el));

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

        for (const element of headingElements) {
          const rect = element.getBoundingClientRect();
          // Check if heading is in the top 30% of viewport
          if (rect.top >= 0 && rect.top <= window.innerHeight * 0.3) {
            const headingId = element.id;
            const uuidId = toc.find(entry => uuidToId(entry.id) === headingId)?.id;

            if (uuidId && uuidId !== activeHeadingId) {
              setActiveHeadingId(uuidId);

              const node = findNodeById(headingTree, uuidId);
              if (node) {
                setActiveHeadingPath(getHeadingPath(node));
              }
            }
            break;
          }
        }
      };

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
    setClickedHeadingId(headingId);
    setActiveHeadingId(headingId);

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

/** Tracks whether a media query currently matches. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
