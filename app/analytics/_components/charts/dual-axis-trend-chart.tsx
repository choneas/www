"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./chart-wrapper"
import { CHART_COLORS, VIEWS_AREA_RAMP, CLAPS_AREA_RAMP } from "./chart-theme"

interface DualAxisTrendChartProps {
    days: { date: string; views: number; claps: number }[]
    showViews: boolean
    showClaps: boolean
}

export function DualAxisTrendChart({ days, showViews, showClaps }: DualAxisTrendChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo(() => {
        const series: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
        const yAxis: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any

        if (showViews) {
            series.push({
                name: t("toggle-show-views"),
                type: "line",
                data: days.map((d) => d.views),
                smooth: true,
                lineStyle: { color: CHART_COLORS.views, width: 2 },
                itemStyle: { color: CHART_COLORS.views },
                areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: VIEWS_AREA_RAMP } },
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
                lineStyle: { color: CHART_COLORS.claps, width: 2 },
                itemStyle: { color: CHART_COLORS.claps },
                areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: CLAPS_AREA_RAMP } },
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
        <ChartWrapper option={option} height={300} label={t("chart-dual-axis")} />
    )
}
