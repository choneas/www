"use client";

import Giscus from "@giscus/react";
import { useLocale } from "next-intl";
import { useTheme } from "@/components/theme-provider";
import { formatDate } from "@/utils/date-format";
import type { PostMetadata } from "@/lib/content";

export function Comment({ metadata, className, type }: { metadata?: PostMetadata, className?: string, type?: "article" | "tweet" }) {
    const locale = useLocale();
    const { resolvedTheme } = useTheme();

    return (
        <div className={'comment ' + className}>
            <Giscus
                repo={(process.env.NEXT_PUBLIC_REPO ?? "") as `${string}/${string}`}
                repoId={process.env.NEXT_PUBLIC_REPO_ID ?? ""}
                category={process.env.NEXT_PUBLIC_CATEGORY ?? ""}
                categoryId={process.env.NEXT_PUBLIC_CATEGORY_ID ?? ""}
                mapping="specific"
                term={type === "article" ? metadata?.slug : formatDate(metadata?.created_time || new Date(), "en", true, false)}
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={resolvedTheme}
                loading={type === "article" ? "lazy" : "eager"}
                lang={locale}
            />
        </div>
    );
}
