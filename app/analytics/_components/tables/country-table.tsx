"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Table } from "@heroui/react"

interface CountryTableProps {
    countryMap: Record<string, number>
}

const countryFlags: Record<string, string> = {
    US: "🇺🇸", CN: "🇨🇳", JP: "🇯🇵", GB: "🇬🇧", DE: "🇩🇪",
    FR: "🇫🇷", KR: "🇰🇷", IN: "🇮🇳", BR: "🇧🇷", CA: "🇨🇦",
    AU: "🇦🇺", RU: "🇷🇺", IT: "🇮🇹", ES: "🇪🇸", NL: "🇳🇱",
    TW: "🇹🇼", HK: "🇭🇰", SG: "🇸🇬", MX: "🇲🇽", ID: "🇮🇩",
    TH: "🇹🇭", VN: "🇻🇳", PH: "🇵🇭", MY: "🇲🇾", TR: "🇹🇷",
    AR: "🇦🇷", CL: "🇨🇱", CO: "🇨🇴", PE: "🇵🇪", ZA: "🇿🇦",
}

export function CountryTable({ countryMap }: CountryTableProps) {
    const t = useTranslations("Analytics")
    const total = Object.values(countryMap).reduce((s, v) => s + v, 0)

    const items = useMemo(() => {
        return Object.entries(countryMap)
            .sort(([, a], [, b]) => b - a)
            .map(([code, count]) => ({ code, count, pct: total > 0 ? (count / total) * 100 : 0 }))
    }, [countryMap, total])

    const columns = [
        { id: "flag", label: "" },
        { id: "country", label: t("table-col-country") },
        { id: "visits", label: t("table-col-visits") },
        { id: "pct", label: t("table-col-pct") },
    ]

    return (
        <Table>
            <Table.Content aria-label={t("tab-geography")} selectionMode="none">
                <Table.Header columns={columns}>
                    {(column) => (
                        <Table.Column id={column.id} isRowHeader={column.id === "country"}>
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
                                    {col === "flag"
                                        ? (countryFlags[item.code] || "🏳")
                                        : col === "country"
                                            ? <span className="text-xs">{item.code}</span>
                                            : col === "visits"
                                                ? <span className="tabular-nums">{item.count.toLocaleString()}</span>
                                                : <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden max-w-[80px]">
                                                        <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(item.pct, 100)}%` }} />
                                                    </div>
                                                    <span className="text-xs tabular-nums">{item.pct.toFixed(1)}%</span>
                                                </div>
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
