import type { ReactNode } from "react";
import type { RichTranslationValues, RichTagsFunction } from "next-intl";

const defaultTags = {
    h1: ((chunks: ReactNode) => <div className="mt-6 text-3xl font-bold">{chunks}</div>) as RichTagsFunction,
    h2: ((chunks: ReactNode) => <div className="mt-5 text-2xl font-bold">{chunks}</div>) as RichTagsFunction,
    h3: ((chunks: ReactNode) => <div className="mt-4 text-xl font-bold">{chunks}</div>) as RichTagsFunction,
    b: ((chunks: ReactNode) => <strong className="font-semibold">{chunks}</strong>) as RichTagsFunction,
    i: ((chunks: ReactNode) => <em className="italic">{chunks}</em>) as RichTagsFunction,
    br: (() => <br />) as RichTagsFunction,
    code: ((chunks: ReactNode) => <code className="font-code">{chunks}</code>) as RichTagsFunction,
    a: ((chunks: ReactNode, options?: { href?: string }) =>
        options?.href
            ? <a href={options.href} target="_blank" rel="noopener noreferrer">{chunks}</a>
            : <>{chunks}</>) as RichTagsFunction,
    ul: ((chunks: ReactNode) => <ul className="list-disc list-outside pl-5 space-y-1">{chunks}</ul>) as RichTagsFunction,
    li: ((chunks: ReactNode) => <li>{chunks}</li>) as RichTagsFunction,
} as const;

export function rt(overrides?: Partial<typeof defaultTags>): RichTranslationValues {
    return { ...defaultTags, ...overrides } as RichTranslationValues;
}

interface RichTranslator {
    rich: (key: string, values?: RichTranslationValues) => ReactNode;
}

export function richText<T extends RichTranslator>(
    t: T,
    overrides?: Partial<typeof defaultTags>
) {
    return (key: Parameters<T["rich"]>[0]) => {
        const tags: Record<string, RichTagsFunction> = { ...defaultTags, ...overrides };

        // Auto-resolve <a> href from sibling {key}Href translation key
        const translator = t as unknown as { has: (k: string) => boolean; raw: (k: string) => string };
        const rawMessage = translator.raw(key as string);
        const hrefKey = (key as string) + "Href";
        let resolvedHref: string | undefined;
        if (rawMessage.includes("</a>") && translator.has(hrefKey)) {
            resolvedHref = translator.raw(hrefKey);
        }

        if (resolvedHref) {
            const userAOverride = overrides?.a;
            tags.a = userAOverride
                ? ((chunks: ReactNode) => (userAOverride as (c: ReactNode, o: Record<string, string>) => ReactNode)(chunks, { href: resolvedHref }))
                : ((chunks: ReactNode, options?: { href?: string }) => {
                      const href = options?.href ?? resolvedHref;
                      return href
                          ? <a href={href} target="_blank" rel="noopener noreferrer">{chunks}</a>
                          : <>{chunks}</>;
                  });
        }

        return t.rich(key, tags as RichTranslationValues);
    };
}

export function plainText(value: string) {
    return value
        .replace(/<br\s*\/?><\/br>/g, " ")
        .replace(/<br\s*\/?>/g, " ")
        .replace(/<\/?[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
