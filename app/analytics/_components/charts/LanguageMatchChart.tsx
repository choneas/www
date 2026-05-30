"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface LanguageMatchChartProps {
    matched: number
    unmatched: number
}

export function LanguageMatchChart({ matched, unmatched }: LanguageMatchChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => ({
        backgroundColor: "transparent",
        grid: { left: 60, right: 16, top: 12, bottom: 24 },
        xAxis: { type: "value", axisLabel: { fontSize: 10 } },
        yAxis: { type: "category", data: [t("lang-match-supported"), t("lang-match-unsupported")], axisLabel: { fontSize: 10 } },
        tooltip: { trigger: "axis" },
        series: [{
            type: "bar",
            data: [
                { value: matched, itemStyle: { color: "#10b981", borderRadius: [0, 4, 4, 0] } },
                { value: unmatched, itemStyle: { color: "#ef4444", borderRadius: [0, 4, 4, 0] } },
            ],
        }],
    }), [matched, unmatched, t])

    return (
        <ChartWrapper option={option} height={160} />
    )
}
