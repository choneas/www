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
                className="max-w-[240px]"
            />
            <span className="text-xs text-foreground/40">{slugs.length} articles</span>
        </div>
    )
}
