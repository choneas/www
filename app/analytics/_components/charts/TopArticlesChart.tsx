"use client"

import { useMemo } from "react"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface TopArticlesChartProps {
    data: { slug: string; value: number }[]
    color: string
    label: string
}

export function TopArticlesChart({ data, color, label }: TopArticlesChartProps) {
    const option = useMemo<EChartsOption>(() => ({
        backgroundColor: "transparent",
        grid: { left: 100, right: 40, top: 8, bottom: 24 },
        xAxis: { type: "value", axisLabel: { fontSize: 10 } },
        yAxis: { type: "category", data: data.map((d) => d.slug).reverse(), axisLabel: { fontSize: 10, width: 90, overflow: "truncate" }, inverse: true },
        tooltip: { trigger: "axis" },
        series: [{
            name: label,
            type: "bar",
            data: data.map((d) => d.value).reverse(),
            itemStyle: {
                color,
                borderRadius: [0, 4, 4, 0],
            },
        }],
    }), [data, color, label])

    return (
        <ChartWrapper option={option} height={Math.max(200, data.length * 30)} />
    )
}
