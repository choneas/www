"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./chart-wrapper"
import { CHART_SERIES_COLORS } from "./chart-theme"
import type { EChartsOption } from "./chart-wrapper"

interface LanguageBreakdownChartProps {
    languageMap: Record<string, number>
}

export function LanguageBreakdownChart({ languageMap }: LanguageBreakdownChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => {
        const entries = Object.entries(languageMap).sort((a, b) => b[1] - a[1])
        const top = entries.slice(0, 8)
        const other = entries.slice(8).reduce((s, [, c]) => s + c, 0)
        const data = top.map(([name, value]) => ({ name, value }))
        if (other > 0) data.push({ name: "Other", value: other })

        const colors = CHART_SERIES_COLORS

        return {
            backgroundColor: "transparent",
            tooltip: { trigger: "item" },
            legend: { bottom: 0, textStyle: { fontSize: 10 } },
            series: [{
                name: t("chart-language-breakdown"),
                type: "pie",
                radius: ["40%", "70%"],
                center: ["50%", "45%"],
                label: { show: true, fontSize: 10 },
                data: data.map((d, i) => ({ ...d, itemStyle: { color: colors[i % colors.length] } })),
            }],
        }
    }, [languageMap, t])

    return (
        <ChartWrapper option={option} height={300} />
    )
}
