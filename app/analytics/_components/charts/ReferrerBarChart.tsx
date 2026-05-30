"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface ReferrerBarChartProps {
    referrerMap: Record<string, number>
}

export function ReferrerBarChart({ referrerMap }: ReferrerBarChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => {
        const entries = Object.entries(referrerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)

        return {
            backgroundColor: "transparent",
            grid: { left: 160, right: 40, top: 8, bottom: 24 },
            xAxis: { type: "value", axisLabel: { fontSize: 10 } },
            yAxis: { type: "category", data: entries.map(([n]) => n.length > 30 ? n.slice(0, 28) + ".." : n).reverse(), axisLabel: { fontSize: 10 }, inverse: true },
            tooltip: { trigger: "axis" },
            series: [{
                name: t("chart-referrer-bar"),
                type: "bar",
                data: entries.map(([, v]) => v).reverse(),
                itemStyle: { color: "#8b5cf6", borderRadius: [0, 4, 4, 0] },
            }],
        }
    }, [referrerMap, t])

    return (
        <ChartWrapper option={option} height={Math.max(250, Object.keys(referrerMap).length * 18)} />
    )
}
