"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface ReferrerTreemapChartProps {
    referrerMap: Record<string, number>
}

export function ReferrerTreemapChart({ referrerMap }: ReferrerTreemapChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => {
        const entries = Object.entries(referrerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)

        return {
            backgroundColor: "transparent",
            tooltip: {
                formatter: (params: { name?: string; value?: number }) =>
                    `${params.name || ""}: ${params.value ?? 0} visits`,
            },
            series: [{
                name: t("chart-referrer-treemap"),
                type: "treemap",
                roam: false,
                data: entries.map(([name, value]) => ({ name, value })),
                label: { show: true, fontSize: 10, formatter: "{b}" },
                itemStyle: { borderColor: "rgba(255,255,255,0.1)" },
                levels: [{ itemStyle: { borderWidth: 1, gapWidth: 1 } }],
            }],
        }
    }, [referrerMap, t])

    return (
        <ChartWrapper option={option} height={400} />
    )
}
