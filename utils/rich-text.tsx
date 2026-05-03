import type { ReactNode } from "react";

type RichRenderer = (chunks: ReactNode, options?: Record<string, string>) => ReactNode;

export function rt(overrides: Record<string, RichRenderer> = {}) {
  return {
    br: () => <br />,
    ...overrides,
  };
}

export function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(plainText).join("");
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).map(plainText).join(" ");
  return "";
}

export function richText<T extends (key: string, values?: Record<string, unknown>) => ReactNode>(
  t: T,
  values: Record<string, RichRenderer> = {},
) {
  return (key: string) => t(key, rt(values));
}
