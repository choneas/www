"use client"

import { type ReactNode } from "react"
import { Card } from "@heroui/react"

interface KpiCardProps {
    icon: ReactNode
    label: string
    value: string
    subtitle?: string
    trend?: { value: number; positive: boolean }
}

export function KpiCard({ icon, label, value, subtitle, trend }: KpiCardProps) {
    return (
        <Card className="border border-foreground/10">
            <div className="p-2.5">
                <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-foreground/50 text-xs font-medium uppercase tracking-wider mb-0.5">
                            <span aria-hidden="true">{icon}</span>
                            <span className="truncate">{label}</span>
                        </div>
                        <div className="text-lg md:text-xl font-bold tracking-tight tabular-nums">
                            {value}
                        </div>
                        {subtitle && (
                            <div className="text-xs text-foreground/50 mt-0.5 truncate">{subtitle}</div>
                        )}
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${trend.positive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                            <span>{trend.positive ? "↑" : "↓"}</span>
                            <span>{Math.abs(trend.value).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
