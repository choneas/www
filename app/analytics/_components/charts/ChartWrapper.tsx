"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import * as echarts from "echarts/core"
import { LineChart, BarChart, PieChart, ScatterChart, HeatmapChart, TreemapChart, MapChart } from "echarts/charts"
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, VisualMapComponent, GeoComponent, DataZoomComponent } from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"

echarts.use([
    LineChart, BarChart, PieChart, ScatterChart, HeatmapChart, TreemapChart, MapChart,
    GridComponent, TooltipComponent, LegendComponent, TitleComponent, VisualMapComponent, GeoComponent, DataZoomComponent,
    CanvasRenderer,
])

type EChartsOption = echarts.EChartsOption

export { echarts, type EChartsOption }

interface ChartWrapperProps {
    option: EChartsOption
    height?: number | string
    className?: string
}

export function ChartWrapper({ option, height = 350, className }: ChartWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<echarts.ECharts | null>(null)
    const [reducedMotion, setReducedMotion] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReducedMotion(mq.matches)
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [])

    const finalOption = useMemo(() => {
        if (reducedMotion) return { ...option, animation: false }
        return option
    }, [option, reducedMotion])

    useEffect(() => {
        if (!containerRef.current) return
        if (!chartRef.current) {
            chartRef.current = echarts.init(containerRef.current, "dark", { renderer: "canvas" })
        }
        chartRef.current.setOption(finalOption, { notMerge: true, lazyUpdate: true })

        const handleResize = () => chartRef.current?.resize()
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [finalOption])

    useEffect(() => {
        return () => {
            chartRef.current?.dispose()
            chartRef.current = null
        }
    }, [])

    return (
        <div ref={containerRef} className={className} style={{ height, width: "100%" }} role="img" aria-label="Chart" />
    )
}
