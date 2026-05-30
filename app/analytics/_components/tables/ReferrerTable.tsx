"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Table, Chip } from "@heroui/react"

interface ReferrerTableProps {
    referrerMap: Record<string, number>
}

function categorize(ref: string): "search" | "social" | "internal" | "external" {
    if (!ref || ref.startsWith("/")) return "internal"
    const searchEngines = ["google", "bing", "baidu", "duckduckgo", "yahoo", "yandex"]
    const social = ["t.co", "twitter", "x.com", "weibo", "instagram", "facebook", "reddit", "bsky.app", "linkedin"]
    const lower = ref.toLowerCase()
    if (searchEngines.some((s) => lower.includes(s))) return "search"
    if (social.some((s) => lower.includes(s))) return "social"
    return "external"
}

export function ReferrerTable({ referrerMap }: ReferrerTableProps) {
    const t = useTranslations("Analytics")
    const total = Object.values(referrerMap).reduce((s, v) => s + v, 0)

    const items = useMemo(() => {
        return Object.entries(referrerMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 50)
            .map(([ref, count]) => ({ ref, count, pct: total > 0 ? (count / total) * 100 : 0, cat: categorize(ref) }))
    }, [referrerMap, total])

    const catMap: Record<string, string> = {
        search: t("referrer-category-search"),
        social: t("referrer-category-social"),
        internal: t("referrer-category-internal"),
        direct: t("referrer-category-direct"),
        external: t("referrer-category-other"),
    }

    const catColorMap: Record<string, "accent" | "warning" | "success" | "default"> = {
        search: "accent",
        social: "warning",
        internal: "success",
        direct: "default",
        external: "default",
    }

    const columns = [
        { id: "referrer", label: t("table-col-referrer") },
        { id: "visits", label: t("table-col-visits") },
        { id: "pct", label: t("table-col-pct") },
        { id: "category", label: t("table-col-category") },
    ]

    return (
        <Table>
            <Table.Content aria-label={t("tab-sources")} selectionMode="none">
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column id={column.id} isRowHeader={column.id === "referrer"}>
                            {column.label}
                        </Table.Column>
                    )}
                </Table.Header>
                <Table.Body items={items}>
                    {(item) => (
                        <Table.Row>
                                    {(columnKey) => {
                                        const col = String(columnKey)
                                        return (<Table.Cell>
                                    {col === "referrer"
                                        ? <span className="font-mono text-xs max-w-[300px] truncate block">{item.ref || "(direct)"}</span>
                                        : col === "visits"
                                            ? <span className="tabular-nums">{item.count.toLocaleString()}</span>
                                            : col === "pct"
                                                ? <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden max-w-[60px]">
                                                        <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(item.pct, 100)}%` }} />
                                                    </div>
                                                    <span className="text-xs tabular-nums">{item.pct.toFixed(1)}%</span>
                                                </div>
                                                : <Chip size="sm" variant="soft" color={catColorMap[item.cat]}>
                                                    {catMap[item.cat]}
                                                </Chip>
                                }
                                </Table.Cell>)
                            }}
                        </Table.Row>
                    )}
                </Table.Body>
            </Table.Content>
        </Table>
    )
}
