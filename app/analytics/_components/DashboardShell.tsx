"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@heroui/react"
import { useTranslations } from "next-intl"

type TabId = "overview" | "content" | "audience" | "geography" | "technology" | "sources" | "engagement" | "events"

interface DashboardShellProps {
    children: (activeTab: TabId) => ReactNode
}

const tabs: { id: TabId; i18nKey: string }[] = [
    { id: "overview", i18nKey: "tab-overview" },
    { id: "content", i18nKey: "tab-content" },
    { id: "audience", i18nKey: "tab-audience" },
    { id: "geography", i18nKey: "tab-geography" },
    { id: "technology", i18nKey: "tab-technology" },
    { id: "sources", i18nKey: "tab-sources" },
    { id: "engagement", i18nKey: "tab-engagement" },
    { id: "events", i18nKey: "tab-events" },
]

export function DashboardShell({ children }: DashboardShellProps) {
    const t = useTranslations("Analytics")
    const [activeTab, setActiveTab] = useState<TabId>("overview")

    return (
        <div className="space-y-4">
            <nav role="tablist" aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto pb-1 border-b border-foreground/10 overscroll-contain touch-manipulation">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "shrink-0 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                            activeTab === tab.id
                                ? "text-accent border-b-2 border-accent -mb-[1px]"
                                : "text-foreground/60 hover:text-foreground"
                        )}
                    >
                        {t(tab.i18nKey)}
                    </button>
                ))}
            </nav>
            {children(activeTab)}
        </div>
    )
}
