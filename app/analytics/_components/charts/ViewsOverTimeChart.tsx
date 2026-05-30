"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface ViewsOverTimeChartProps {
    viewsDaily: { date: string; views: number; claps: number }[]
}

export function ViewsOverTimeChart({ viewsDaily }: ViewsOverTimeChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => ({
        backgroundColor: "transparent",
        grid: { left: 40, right: 16, top: 12, bottom: 24 },
        xAxis: { type: "category", data: viewsDaily.map((d) => d.date), axisLabel: { fontSize: 10 } },
        yAxis: { type: "value", axisLabel: { fontSize: 10 } },
        tooltip: { trigger: "axis" },
        series: [{
            name: t("toggle-show-views"),
            type: "line",
            data: viewsDaily.map((d) => d.views),
            smooth: true,
            lineStyle: { color: "#6366f1", width: 2 },
            itemStyle: { color: "#6366f1" },
            areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(99,102,241,0.3)" }, { offset: 1, color: "rgba(99,102,241,0.02)" }] } },
        }],
    }), [viewsDaily, t])

    return (
        <ChartWrapper option={option} height={300} />
    )
}
