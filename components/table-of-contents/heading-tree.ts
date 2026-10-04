import type { TableOfContentsEntry } from "notion-utils";

/**
 * Heading node in the tree structure
 * Represents a heading with parent-child relationships
 */
export interface HeadingNode {
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
export function buildHeadingTree(toc: TableOfContentsEntry[]): HeadingNode[] {
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
export function getHeadingPath(node: HeadingNode): string[] {
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
export function findNodeById(roots: HeadingNode[], id: string): HeadingNode | null {
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
export function uuidToId(uuid: string): string {
  return uuid.replace(/-/g, "");
}

/**
 * Scroll to a heading element with smooth animation
 * Calculates offset to account for fixed navbar height
 * @param headingId - UUID format heading ID
 */
export function scrollToHeading(headingId: string): void {
  // Convert UUID to DOM ID format
  const domId = uuidToId(headingId);
  const element = document.getElementById(domId);

  if (!element) {
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
