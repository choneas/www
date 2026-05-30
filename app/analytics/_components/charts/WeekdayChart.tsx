"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface WeekdayChartProps {
    weekdayDistribution: number[]
}

export function WeekdayChart({ weekdayDistribution }: WeekdayChartProps) {
    const t = useTranslations("Analytics")
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const option = useMemo<EChartsOption>(() => ({
        backgroundColor: "transparent",
        grid: { left: 8, right: 16, top: 8, bottom: 24 },
        xAxis: { type: "category", data: dayNames, axisLabel: { fontSize: 10 } },
        yAxis: { type: "value", axisLabel: { fontSize: 10 } },
        tooltip: { trigger: "axis" },
        series: [{
            name: t("chart-weekday"),
            type: "bar",
            data: weekdayDistribution.map((v, i) => ({
                value: v,
                itemStyle: {
                    color: i === 0 || i === 6 ? "#f59e0b" : "#6366f1",
                    borderRadius: [4, 4, 0, 0],
                },
            })),
        }],
    }), [weekdayDistribution, t])

    return (
        <ChartWrapper option={option} height={250} />
    )
}
