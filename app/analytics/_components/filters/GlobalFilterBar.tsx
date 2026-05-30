"use client"

import { useTranslations } from "next-intl"
import { Input } from "@heroui/react"

interface GlobalFilterBarProps {
    slugs: string[]
    selectedSlugs: string[]
    onSlugChange: (slugs: string[]) => void
    onRefresh?: () => void
}

export function GlobalFilterBar({ slugs }: GlobalFilterBarProps) {
    const t = useTranslations("Analytics")

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Input
                placeholder={t("filter-search-slug")}
                size="sm"
                className="max-w-[240px]"
                startContent={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                }
            />
            <span className="text-xs text-foreground/40">{slugs.length} articles</span>
        </div>
    )
}
