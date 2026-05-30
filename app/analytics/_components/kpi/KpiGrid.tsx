"use client"

import type { AnalyticsData } from "@/lib/analytics/aggregate"
import { useTranslations } from "next-intl"
import { LuEye, LuFileText, LuPercent, LuTrendingUp, LuSparkles, LuTrophy, LuChartBar } from "react-icons/lu"
import { PiHandsClappingLight } from "react-icons/pi"
import { KpiCard } from "./KpiCard"

interface KpiGridProps {
    data: AnalyticsData
}

export function KpiGrid({ data }: KpiGridProps) {
    const t = useTranslations("Analytics")

    const topArticle = data.topByViews[0]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <KpiCard
                icon={<LuEye size={14} />}
                label={t("kpi-total-views")}
                value={data.totalViews.toLocaleString()}
            />
            <KpiCard
                icon={<PiHandsClappingLight size={14} />}
                label={t("kpi-total-claps")}
                value={data.totalClaps.toLocaleString()}
            />
            <KpiCard
                icon={<LuFileText size={14} />}
                label={t("kpi-articles")}
                value={data.totalArticles.toLocaleString()}
            />
            <KpiCard
                icon={<LuPercent size={14} />}
                label={t("kpi-clap-rate")}
                value={`${data.clapRate.toFixed(1)}%`}
            />
            <KpiCard
                icon={<LuTrendingUp size={14} />}
                label={t("kpi-views-today")}
                value={data.viewsToday.toLocaleString()}
            />
            <KpiCard
                icon={<LuSparkles size={14} />}
                label={t("kpi-claps-today")}
                value={data.clapsToday.toLocaleString()}
            />
            <KpiCard
                icon={<LuTrophy size={14} />}
                label={t("kpi-top-article")}
                value={topArticle ? topArticle.views.toLocaleString() : "-"}
                subtitle={topArticle?.slug || ""}
            />
            <KpiCard
                icon={<LuChartBar size={14} />}
                label={t("kpi-avg-views")}
                value={data.avgViewsPerArticle.toLocaleString()}
            />
        </div>
    )
}
