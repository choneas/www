"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"

interface DualAxisTrendChartProps {
    days: { date: string; views: number; claps: number }[]
    showViews: boolean
    showClaps: boolean
}

export function DualAxisTrendChart({ days, showViews, showClaps }: DualAxisTrendChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo(() => {
        const series: any[] = []
        const yAxis: any[] = []

        if (showViews) {
            series.push({
                name: t("toggle-show-views"),
                type: "line",
                data: days.map((d) => d.views),
                smooth: true,
                lineStyle: { color: "#6366f1", width: 2 },
                itemStyle: { color: "#6366f1" },
                areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(99,102,241,0.3)" }, { offset: 1, color: "rgba(99,102,241,0.02)" }] } },
            })
            yAxis.push({ type: "value", axisLabel: { fontSize: 10 }, name: t("toggle-show-views") })
        }

        if (showClaps) {
            series.push({
                name: t("toggle-show-claps"),
                type: "line",
                yAxisIndex: showViews ? 1 : 0,
                data: days.map((d) => d.claps),
                smooth: true,
                lineStyle: { color: "#f59e0b", width: 2 },
                itemStyle: { color: "#f59e0b" },
                areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(245,158,11,0.3)" }, { offset: 1, color: "rgba(245,158,11,0.02)" }] } },
            })
            yAxis.push({ type: "value", axisLabel: { fontSize: 10 }, name: t("toggle-show-claps") })
        }

        return {
            backgroundColor: "transparent",
            legend: { bottom: 0, textStyle: { fontSize: 10 } },
            grid: { left: 48, right: showViews && showClaps ? 48 : 16, top: 12, bottom: 32 },
            xAxis: { type: "category", data: days.map((d) => d.date), axisLabel: { fontSize: 10 } },
            yAxis,
            tooltip: { trigger: "axis" },
            series,
        }
    }, [days, showViews, showClaps, t])

    return (
        <ChartWrapper option={option} height={300} />
    )
}
