"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Table, Input } from "@heroui/react"

interface ArticleData {
    slug: string
    views: number
    claps: number
    clapRate: number
    firstSeen: number | null
    lastSeen: number | null
}

interface ArticlesTableProps {
    articles: ArticleData[]
}

function formatTimestamp(ts: number | null): string {
    if (!ts) return "-"
    return new Date(ts * 1000).toLocaleDateString()
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
    const t = useTranslations("Analytics")
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        return articles.filter((a) =>
            !search || a.slug.toLowerCase().includes(search.toLowerCase())
        )
    }, [articles, search])

    const columns = [
        { id: "slug", label: t("table-col-slug") },
        { id: "views", label: t("table-col-views") },
        { id: "claps", label: t("table-col-claps") },
        { id: "clapRate", label: t("table-col-clap-rate") },
        { id: "firstSeen", label: t("table-col-first-seen") },
        { id: "lastSeen", label: t("table-col-last-seen") },
    ]

    return (
        <div className="space-y-3">
            <Input
                placeholder={t("filter-search-slug")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
                className="max-w-xs"
            />
            <Table>
                <Table.Content aria-label={t("tab-content")} selectionMode="none">
                    <Table.Header columns={columns}>
                        {(column) => (
                            <Table.Column id={column.id} isRowHeader={column.id === "slug"}>
                                {column.label}
                            </Table.Column>
                        )}
                    </Table.Header>
                    <Table.Body items={filtered}>
                        {(item) => (
                            <Table.Row>
                                {(columnKey) => (
                                    <Table.Cell>
                                        {columnKey === "slug"
                                            ? <span className="font-mono text-xs max-w-[200px] truncate block">{item.slug}</span>
                                            : columnKey === "views"
                                                ? <span className="tabular-nums">{item.views.toLocaleString()}</span>
                                                : columnKey === "claps"
                                                    ? <span className="tabular-nums">{item.claps.toLocaleString()}</span>
                                                    : columnKey === "clapRate"
                                                        ? <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden max-w-[80px]">
                                                                <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(item.clapRate, 100)}%` }} />
                                                            </div>
                                                            <span className="text-xs tabular-nums">{item.clapRate.toFixed(1)}%</span>
                                                        </div>
                                                        : columnKey === "firstSeen"
                                                            ? <span className="text-xs text-foreground/60">{formatTimestamp(item.firstSeen)}</span>
                                                            : <span className="text-xs text-foreground/60">{formatTimestamp(item.lastSeen)}</span>
                                    }
                                    </Table.Cell>
                                )}
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Content>
            </Table>
        </div>
    )
}
