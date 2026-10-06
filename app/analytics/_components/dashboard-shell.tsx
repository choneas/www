"use client"

import { useState, type ReactNode } from "react"
import { Tabs, TabList, Tab, TabPanel, type Key } from "react-aria-components"
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

    const handleSelectionChange = (key: Key) => {
        setActiveTab(key as TabId)
    }

    return (
        <Tabs selectedKey={activeTab} onSelectionChange={handleSelectionChange} className="space-y-4">
            <TabList
                aria-label={t("tablist-label")}
                className="flex gap-1 overflow-x-auto pb-1 border-b border-foreground/10 overscroll-contain touch-manipulation"
            >
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        id={tab.id}
                        className={({ isSelected }) =>
                            `shrink-0 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${isSelected
                                ? "text-accent border-b-2 border-accent -mb-[1px]"
                                : "text-foreground/60 hover:text-foreground"}`
                        }
                    >
                        {t(tab.i18nKey)}
                    </Tab>
                ))}
            </TabList>
            <TabPanel id={activeTab}>
                {children(activeTab)}
            </TabPanel>
        </Tabs>
    )
}
