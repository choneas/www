import { useState, useEffect, useRef } from "react";
import { ScrollShadow } from "@heroui/react";
import { useTranslations } from "next-intl";
import type { TableOfContentsEntry } from "notion-utils";
import { scrollToHeading } from "./heading-tree";
import { TOCItem } from "./toc-item";

/**
 * Desktop Table of Contents component
 * Displays TOC in a fixed sidebar with DOT indent indicators
 * Implements hover states and auto-scroll to active item
 */
export function DesktopTOC({
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

  const [articleContainerRight, setArticleContainerRight] = useState(0);

  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

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

  // Fixed at right side of content, vertically centered
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
