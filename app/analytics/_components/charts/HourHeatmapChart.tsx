"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface HourHeatmapChartProps {
    hourlyDistribution: number[]
    weekdayDistribution: number[]
}

const hourNames = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]

export function HourHeatmapChart({ hourlyDistribution }: HourHeatmapChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => {
        const maxVal = Math.max(...hourlyDistribution, 1)
        const data = hourlyDistribution.map((v, h) => [h, 0, v])

        return {
            backgroundColor: "transparent",
            grid: { left: 8, right: 16, top: 8, bottom: 24 },
            xAxis: { type: "category", data: hourNames, axisLabel: { fontSize: 10, rotate: 45 }, splitArea: { show: true } },
            yAxis: { type: "category", data: [t("chart-hour-heatmap")], axisLabel: { fontSize: 10 } },
            tooltip: { trigger: "item", formatter: (params: { data?: number[] }) => `${(params.data as number[])?.[0] ?? ""}:00 - ${(params.data as number[])?.[2] ?? 0} visits` },
            visualMap: {
                min: 0, max: maxVal,
                orient: "horizontal", left: "center", bottom: 4,
                inRange: { color: ["rgba(99,102,241,0.1)", "rgba(99,102,241,0.4)", "rgba(99,102,241,0.9)"] },
                textStyle: { fontSize: 10 },
            },
            series: [{
                type: "heatmap",
                data,
                label: { show: true, fontSize: 9, formatter: (p: { data?: number[] }) => {
                    const v = (p.data as number[])?.[2]
                    return v && v > 0 ? String(v) : ""
                } },
                emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" } },
            }],
        }
    }, [hourlyDistribution, t])

    return (
        <ChartWrapper option={option} height={140} />
    )
}
