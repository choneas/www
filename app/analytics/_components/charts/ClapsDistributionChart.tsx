"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface ClapsDistributionChartProps {
    topByClaps: { slug: string; views: number; claps: number }[]
}

export function ClapsDistributionChart({ topByClaps }: ClapsDistributionChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => ({
        backgroundColor: "transparent",
        grid: { left: 100, right: 16, top: 8, bottom: 24 },
        xAxis: { type: "value", axisLabel: { fontSize: 10 } },
        yAxis: { type: "category", data: topByClaps.map((d) => d.slug).reverse(), axisLabel: { fontSize: 10, width: 90, overflow: "truncate" }, inverse: true },
        tooltip: { trigger: "axis" },
        series: [{
            name: t("chart-clap-distribution"),
            type: "bar",
            data: topByClaps.map((d) => d.claps).reverse(),
            itemStyle: { color: "#f59e0b", borderRadius: [0, 4, 4, 0] },
        }],
    }), [topByClaps, t])

    return (
        <ChartWrapper option={option} height={Math.max(200, topByClaps.length * 30)} />
    )
}
