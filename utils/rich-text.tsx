import type { ReactNode } from "react";

type RichOptions = Record<string, string | number | Date | undefined>;
type RichRenderer = (chunks: ReactNode, options?: RichOptions) => ReactNode;
type TranslatorLike = (key: string, values?: Record<string, string | number | Date>) => ReactNode;

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

export function richText(t: TranslatorLike, values: Record<string, RichRenderer> = {}) {
  return (key: string) => t(key, rt(values) as unknown as Record<string, string | number | Date>);
}
