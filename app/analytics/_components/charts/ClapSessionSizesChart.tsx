"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface ClapSessionSizesChartProps {
    clapSessionSizes: Record<number, number>
}

export function ClapSessionSizesChart({ clapSessionSizes }: ClapSessionSizesChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => {
        const entries = Object.entries(clapSessionSizes)
            .map(([k, v]) => ({ claps: parseInt(k), count: v }))
            .sort((a, b) => a.claps - b.claps)

        return {
            backgroundColor: "transparent",
            grid: { left: 40, right: 16, top: 8, bottom: 24 },
            xAxis: { type: "category", data: entries.map((d) => String(d.claps)), axisLabel: { fontSize: 10 }, name: "Claps per session" },
            yAxis: { type: "value", axisLabel: { fontSize: 10 }, name: "Sessions" },
            tooltip: { trigger: "axis", formatter: (params: { data?: number[] }[]) => {
                const d = (params[0]?.data as number[] | undefined)
                return d ? `${d[0]} claps: ${d[1]} sessions` : ""
            } },
            series: [{
                name: t("chart-clap-session-size"),
                type: "bar",
                data: entries.map((d) => d.count),
                itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] },
            }],
        }
    }, [clapSessionSizes, t])

    if (Object.keys(clapSessionSizes).length === 0) return null

    return (
        <ChartWrapper option={option} height={250} />
    )
}
