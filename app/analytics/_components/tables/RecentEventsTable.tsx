"use client"

import { memo, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Table, Chip, Button } from "@heroui/react"
import { LuRefreshCw } from "react-icons/lu"

interface EventRecord {
    t: number
    type: "view" | "clap"
    ref?: string
    c?: string
    d?: "m" | "d" | "t"
    lang?: string
    n?: number
}

interface RecentEventsTableProps {
    events: EventRecord[]
    onRefresh?: () => void
}

const countryFlags: Record<string, string> = {
    US: "🇺🇸", CN: "🇨🇳", JP: "🇯🇵", GB: "🇬🇧", DE: "🇩🇪",
    FR: "🇫🇷", KR: "🇰🇷", IN: "🇮🇳", BR: "🇧🇷", CA: "🇨🇦",
    AU: "🇦🇺", RU: "🇷🇺", IT: "🇮🇹", ES: "🇪🇸", NL: "🇳🇱",
}

const deviceIcons: Record<string, string> = { m: "📱", d: "🖥", t: "📟" }

function relativeTime(ts: number, t: (key: string) => string): string {
    const now = Date.now() / 1000
    const diff = now - ts
    if (diff < 60) return t("events-relative-just-now")
    if (diff < 3600) return t("events-relative-minutes").replace("{n}", String(Math.floor(diff / 60)))
    if (diff < 86400) return t("events-relative-hours").replace("{n}", String(Math.floor(diff / 3600)))
    if (diff < 604800) return t("events-relative-days").replace("{n}", String(Math.floor(diff / 86400)))
    return new Date(ts * 1000).toLocaleDateString()
}

function FilterSelect({ value, onChange, options }: {
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-foreground/10 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    )
}

export const RecentEventsTable = memo(function RecentEventsTable({ events, onRefresh }: RecentEventsTableProps) {
    const ta = useTranslations("Analytics")

    const [typeFilter, setTypeFilter] = useState("all")
    const [countryFilter, setCountryFilter] = useState("all")
    const [deviceFilter, setDeviceFilter] = useState("all")

    const countries = useMemo(() => {
        const set = new Set<string>()
        events.forEach((e) => { if (e.type === "view" && e.c) set.add(e.c) })
        return [...set].sort()
    }, [events])

    const filtered = useMemo(() => {
        return events.filter((e) => {
            if (typeFilter === "view" && e.type !== "view") return false
            if (typeFilter === "clap" && e.type !== "clap") return false
            if (countryFilter !== "all" && e.type === "view" && e.c !== countryFilter) return false
            return !(deviceFilter !== "all" && e.type === "view" && e.d !== deviceFilter);

        }).slice(0, 100)
    }, [events, typeFilter, countryFilter, deviceFilter])

    const columns = [
        { id: "time", label: ta("table-col-timestamp") },
        { id: "type", label: ta("table-col-type") },
        { id: "country", label: ta("table-col-country") },
        { id: "device", label: ta("table-col-device") },
        { id: "lang", label: ta("table-col-language") },
        { id: "ref", label: ta("table-col-referrer") },
        { id: "claps", label: ta("table-col-clap-count") },
    ]

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <FilterSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                        { value: "all", label: ta("filter-all-types") },
                        { value: "view", label: ta("filter-views-only") },
                        { value: "clap", label: ta("filter-claps-only") },
                    ]}
                />
                <FilterSelect
                    value={countryFilter}
                    onChange={setCountryFilter}
                    options={[
                        { value: "all", label: ta("filter-all-countries") },
                        ...countries.map((c) => ({ value: c, label: c })),
                    ]}
                />
                <FilterSelect
                    value={deviceFilter}
                    onChange={setDeviceFilter}
                    options={[
                        { value: "all", label: ta("filter-all-devices") },
                        { value: "m", label: ta("device-mobile") },
                        { value: "d", label: ta("device-desktop") },
                        { value: "t", label: ta("device-tablet") },
                    ]}
                />
                {onRefresh && (
                    <Button variant="ghost" size="sm" onPress={onRefresh} isIconOnly>
                        <LuRefreshCw size={14} />
                    </Button>
                )}
            </div>
            <Table>
                <Table.Content aria-label={ta("tab-events")} selectionMode="none">
                    <Table.Header columns={columns}>
                        {(column) => (
                            <Table.Column id={column.id}>{column.label}</Table.Column>
                        )}
                    </Table.Header>
                    <Table.Body items={filtered}>
                        {(item) => (
                            <Table.Row>
                                    {(columnKey) => {
                                        const col = String(columnKey)
                                        return (<Table.Cell>
                                        {col === "time"
                                            ? <span className="text-xs text-foreground/60">{relativeTime(item.t, ta)}</span>
                                            : col === "type"
                                                ? <Chip size="sm" variant="primary" color={item.type === "view" ? "accent" : "warning"}>
                                                    {item.type === "view" ? ta("events-type-view") : ta("events-type-clap")}
                                                </Chip>
                                                : col === "country"
                                                    ? <span className="text-xs">{item.type === "view" && item.c ? `${countryFlags[item.c] || ""} ${item.c}` : "-"}</span>
                                                    : col === "device"
                                                        ? <span className="text-sm">{item.type === "view" && item.d ? deviceIcons[item.d] || item.d : "-"}</span>
                                                        : col === "lang"
                                                            ? <span className="text-xs">{item.type === "view" && item.lang ? item.lang : "-"}</span>
                                                            : col === "ref"
                                                                ? <span className="font-mono text-xs max-w-[150px] truncate block">{item.type === "view" && item.ref ? item.ref : "-"}</span>
                                                                : <span className="tabular-nums text-xs">{item.type === "clap" ? item.n : "-"}</span>
                                    }
                                    </Table.Cell>)
                                }}
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Content>
            </Table>
        </div>
    )
})
