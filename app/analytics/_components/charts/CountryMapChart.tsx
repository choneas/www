"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { ChartWrapper, echarts } from "./ChartWrapper"
import type { EChartsOption } from "./ChartWrapper"
import { useEffect, useState } from "react"

interface CountryMapChartProps {
    countryMap: Record<string, number>
}

const countryNameMap: Record<string, string> = {
    US: "United States", CN: "China", JP: "Japan", GB: "United Kingdom", DE: "Germany",
    FR: "France", KR: "South Korea", IN: "India", BR: "Brazil", CA: "Canada",
    AU: "Australia", RU: "Russia", IT: "Italy", ES: "Spain", NL: "Netherlands",
    TW: "Taiwan", HK: "Hong Kong", SG: "Singapore", MX: "Mexico", ID: "Indonesia",
    TH: "Thailand", VN: "Vietnam", PH: "Philippines", MY: "Malaysia", TR: "Turkey",
    AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru", ZA: "South Africa",
    PL: "Poland", UA: "Ukraine", SE: "Sweden", NO: "Norway", DK: "Denmark",
    FI: "Finland", BE: "Belgium", AT: "Austria", CH: "Switzerland", PT: "Portugal",
    IE: "Ireland", NZ: "New Zealand", CZ: "Czech Republic", GR: "Greece",
    HU: "Hungary", RO: "Romania", BG: "Bulgaria", AE: "United Arab Emirates",
    SA: "Saudi Arabia", EG: "Egypt", NG: "Nigeria", KE: "Kenya", PK: "Pakistan",
    BD: "Bangladesh", LK: "Sri Lanka", MM: "Myanmar", KH: "Cambodia", NP: "Nepal",
}

export function CountryMapChart({ countryMap }: CountryMapChartProps) {
    const t = useTranslations("Analytics")
    const [worldReady, setWorldReady] = useState(false)
    const [geoError, setGeoError] = useState(false)

    useEffect(() => {
        fetch("https://raw.githubusercontent.com/drei01/geojson-world-cities/refs/heads/main/countries.geo.json")
            .then((r) => {
                if (!r.ok) throw new Error("failed")
                return r.json()
            })
            .then((geo) => {
                echarts.registerMap("world", geo)
                setWorldReady(true)
            })
            .catch(() => {
                echarts.registerMap("world", { type: "FeatureCollection", features: [] })
                setGeoError(true)
                setWorldReady(true)
            })
    }, [])

    const option = useMemo<EChartsOption>(() => ({
        backgroundColor: "transparent",
        tooltip: {
            trigger: "item",
            formatter: (params: { name?: string; value?: number }) =>
                `${params.name || ""}: ${params.value ?? 0}`,
        },
        visualMap: {
            min: 0,
            max: Math.max(...Object.values(countryMap), 1),
            left: 8,
            bottom: 16,
            inRange: { color: ["rgba(99,102,241,0.1)", "rgba(99,102,241,0.3)", "rgba(99,102,241,0.6)", "rgba(99,102,241,0.9)"] },
            textStyle: { color: "#888", fontSize: 10 },
        },
        series: [{
            name: t("chart-world-map"),
            type: "map",
            map: "world",
            roam: true,
            emphasis: { label: { show: true } },
            data: Object.entries(countryMap).map(([code, count]) => ({
                name: countryNameMap[code] || code,
                value: count,
            })),
        }],
    }), [countryMap, t])

    if (!worldReady) {
        return (
            <div className="flex items-center justify-center h-[350px] text-foreground/40">
                {t("loading")}
            </div>
        )
    }

    if (geoError) {
        return (
            <div className="flex items-center justify-center h-[350px] text-foreground/40">
                {t("empty-no-data")}
            </div>
        )
    }

    return (
        <ChartWrapper option={option} height={350} />
    )
}
