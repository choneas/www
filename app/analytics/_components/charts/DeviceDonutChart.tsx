"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"

interface DeviceDonutChartProps {
    deviceMap: { m: number; d: number; t: number }
}

export function DeviceDonutChart({ deviceMap }: DeviceDonutChartProps) {
    const t = useTranslations("Analytics")

    const option = useMemo<EChartsOption>(() => ({
        backgroundColor: "transparent",
        tooltip: { trigger: "item" },
        legend: { bottom: 0, textStyle: { fontSize: 10 } },
        series: [{
            name: t("chart-device-breakdown"),
            type: "pie",
            radius: ["45%", "75%"],
            center: ["50%", "45%"],
            label: { show: true, formatter: "{b}\n{d}%" },
            data: [
                { value: deviceMap.m, name: t("device-mobile"), itemStyle: { color: "#6366f1" } },
                { value: deviceMap.d, name: t("device-desktop"), itemStyle: { color: "#f59e0b" } },
                { value: deviceMap.t, name: t("device-tablet"), itemStyle: { color: "#10b981" } },
            ].filter((d) => d.value > 0),
        }],
    }), [deviceMap, t])

    return (
        <ChartWrapper option={option} height={300} />
    )
}
