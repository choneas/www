import type { TableOfContentsEntry } from "notion-utils";

// DOT configuration for desktop TOC
const DOT_WIDTH_CLASS = {
  0: "w-5", // px - H1 longest (20px)
  1: "w-3.5", // px - H2 medium (14px)
  2: "w-2", // px - H3 shortest (8px)
} as const;

/**
 * DOT indicator component for desktop TOC
 * Displays a continuous rounded rectangle bar for all headings
 * H1 has longest DOT, H2 medium, H3 shortest
 * All DOTs are left-aligned at the same position
 * @param indentLevel - Heading indent level (0/1/2)
 */
function DOTIndicator({ indentLevel }: { indentLevel: 0 | 1 | 2 }) {
  return (
    <div
      className={`rounded-full shrink-0 h-[3px] mr-2 bg-[color-mix(in_srgb,var(--color-foreground)_60%,transparent)] ${DOT_WIDTH_CLASS[indentLevel]}`}
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

export function TOCItem({
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
  // Text color based on state priority:
  // 1. Active (current reading position): foreground/95
  // 2. Item hovered: foreground/90
  // 3. Parent (TOC container) hovered: foreground/80
  // 4. Default: foreground/70
  const getTextClass = () => {
    if (isActive || isInActivePath) {
      return 'text-[color-mix(in_srgb,var(--color-foreground)_95%,transparent)] font-medium';
    }
    if (isItemHovered) {
      return 'text-[color-mix(in_srgb,var(--color-foreground)_90%,transparent)] font-normal';
    }
    if (isParentHovered) {
      return 'text-[color-mix(in_srgb,var(--color-foreground)_80%,transparent)] font-normal';
    }
    return 'text-[color-mix(in_srgb,var(--color-foreground)_70%,transparent)] font-normal';
  };

  return (
    <li ref={itemRef}>
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`text-left w-full transition-colors flex items-center cursor-pointer ${getTextClass()}`}
        tabIndex={0}
        aria-current={isActive ? 'location' : undefined}
      >
        <DOTIndicator indentLevel={entry.indentLevel as 0 | 1 | 2} />
        <span className="truncate">{entry.text}</span>
      </button>
    </li>
  );
}
