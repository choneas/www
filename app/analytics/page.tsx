"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { Card, Skeleton, Button, Switch, Input } from "@heroui/react"
import type { AnalyticsData } from "@/lib/analytics/aggregate"
import { DashboardShell } from "./_components/DashboardShell"
import { KpiGrid } from "./_components/kpi/KpiGrid"
import { ArticlesTable } from "./_components/tables/ArticlesTable"
import { CountryTable } from "./_components/tables/CountryTable"
import { ReferrerTable } from "./_components/tables/ReferrerTable"
import { RecentEventsTable } from "./_components/tables/RecentEventsTable"

const DualAxisTrendChart = dynamic(() => import("./_components/charts/DualAxisTrendChart").then((m) => m.DualAxisTrendChart), { ssr: false })
const TopArticlesChart = dynamic(() => import("./_components/charts/TopArticlesChart").then((m) => m.TopArticlesChart), { ssr: false })
const DeviceDonutChart = dynamic(() => import("./_components/charts/DeviceDonutChart").then((m) => m.DeviceDonutChart), { ssr: false })
const CountryMapChart = dynamic(() => import("./_components/charts/CountryMapChart").then((m) => m.CountryMapChart), { ssr: false })
const LanguageBreakdownChart = dynamic(() => import("./_components/charts/LanguageBreakdownChart").then((m) => m.LanguageBreakdownChart), { ssr: false })
const LanguageMatchChart = dynamic(() => import("./_components/charts/LanguageMatchChart").then((m) => m.LanguageMatchChart), { ssr: false })
const ReferrerTreemapChart = dynamic(() => import("./_components/charts/ReferrerTreemapChart").then((m) => m.ReferrerTreemapChart), { ssr: false })
const ReferrerBarChart = dynamic(() => import("./_components/charts/ReferrerBarChart").then((m) => m.ReferrerBarChart), { ssr: false })
const HourHeatmapChart = dynamic(() => import("./_components/charts/HourHeatmapChart").then((m) => m.HourHeatmapChart), { ssr: false })
const WeekdayChart = dynamic(() => import("./_components/charts/WeekdayChart").then((m) => m.WeekdayChart), { ssr: false })
const ClapsDistributionChart = dynamic(() => import("./_components/charts/ClapsDistributionChart").then((m) => m.ClapsDistributionChart), { ssr: false })
const ClapSessionSizesChart = dynamic(() => import("./_components/charts/ClapSessionSizesChart").then((m) => m.ClapSessionSizesChart), { ssr: false })

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return <Card className="border border-foreground/10"><div className="p-3"><h2 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">{title}</h2>{children}</div></Card>
}

export default function AnalyticsPage() {
    const t = useTranslations("Analytics")
    const [password, setPassword] = useState("")
    const [authError, setAuthError] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)
    const [authed, setAuthed] = useState(false)
    const [checkedSession, setCheckedSession] = useState(false)
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [showViews, setShowViews] = useState(true)
    const [showClaps, setShowClaps] = useState(true)
    const [trendData, setTrendData] = useState<{ date: string; views: number; claps: number }[]>([])

    useEffect(() => {
        const stored = localStorage.getItem("analytics_pass")
        if (stored) handleAuth(stored)
        else setCheckedSession(true)
    }, [])

    const handleAuth = async (pw?: string) => {
        const p = pw ?? password
        if (!p) return
        setAuthLoading(true)
        setAuthError(false)
        try {
            const res = await fetch("/api/analytics/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: p }) })
            const d = await res.json()
            if (d.ok) {
                localStorage.setItem("analytics_pass", p)
                setAuthed(true)
            } else {
                if (pw) localStorage.removeItem("analytics_pass")
                else setAuthError(true)
            }
        } catch {
            if (pw) localStorage.removeItem("analytics_pass")
            else setAuthError(true)
        }
        finally { setAuthLoading(false) }
    }

    useEffect(() => {
        if (!authed) return
        fetch("/api/analytics/data/overview").then(r => r.json()).then(d => setData(d)).catch(() => setError(true)).finally(() => setLoading(false))
    }, [authed])

    useEffect(() => {
        if (!data) return
        const sl = data.articles.map(a => a.slug)
        if (!sl.length) { setTrendData([]); return }
        let c = false
        Promise.all(sl.slice(0, 5).map(s => fetch(`/api/analytics/data/trend?slug=${encodeURIComponent(s)}`).then(r => r.json())))
            .then(rs => { if (c) return; const m: Record<string,{views:number;claps:number}>={}; rs.forEach(r => (r.days||[]).forEach((d:{date:string;views:number;claps:number}) => { if(!m[d.date])m[d.date]={views:0,claps:0}; m[d.date].views+=d.views; m[d.date].claps+=d.claps })); setTrendData(Object.entries(m).map(([date,v])=>({date,...v})).sort((a,b)=>a.date.localeCompare(b.date))) })
        return () => { c = true }
    }, [data])

    if (!checkedSession) return null
    if (!authed) return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm text-center">
                <p className="text-foreground/60 text-sm mb-2">{t("auth-description")}</p>
                <Input type="password" name="password" autoComplete="current-password" placeholder={t("auth-placeholder")} value={password} onChange={e => { setPassword(e.target.value); setAuthError(false) }} onKeyDown={e => { if (e.key === "Enter") void handleAuth() }} autoFocus disabled={authLoading} className="rounded-full" />
                {authError && <p className="text-danger text-sm mt-3" role="alert">{t("auth-error")}</p>}
            </div>
        </main>
    )
    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-4" aria-busy="true">
            <Skeleton className="h-8 w-48 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{Array.from({length:8}).map((_,i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
                <Skeleton className="h-75 rounded-lg" />
        </div>
    )
    if (error || !data) return (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center" role="alert">
            <p className="text-foreground/60 mb-4">{t("error-load-failed")}</p>
                                        <Button variant="flat" onPress={() => { setLoading(true); setError(false); fetch("/api/analytics/data/overview").then(r => r.json()).then(d => setData(d)).catch(() => setError(true)).finally(() => setLoading(false)) }}>{t("error-retry")}</Button>
        </div>
    )

    return (
        <div className="min-h-screen mt-16">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <div><h1 className="text-2xl font-bold">{t("page-title")}</h1><p className="text-sm text-foreground/50 mt-0.5">{data.totalArticles} articles · {data.totalViews.toLocaleString()} total views</p></div>
                <DashboardShell>
                    {(activeTab) => {
                        switch (activeTab) {
                            case "overview": return <div className="space-y-4"><KpiGrid data={data} /><ChartCard title={t("chart-dual-axis")}><div className="flex items-center gap-4 mb-3"><Switch size="sm" isSelected={showViews} onChange={setShowViews}><span className="text-xs">{t("toggle-show-views")}</span></Switch><Switch size="sm" isSelected={showClaps} onChange={setShowClaps}><span className="text-xs">{t("toggle-show-claps")}</span></Switch></div>{trendData.length>0?<DualAxisTrendChart days={trendData} showViews={showViews} showClaps={showClaps}/>:                                    <div className="text-foreground/70">{t("empty-no-data")}</div>}</ChartCard></div>
                            case "content": return <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><ChartCard title={t("chart-top-articles-views")}><TopArticlesChart data={data.topByViews.map(a=>({slug:a.slug,value:a.views}))} color="#6366f1" label={t("toggle-show-views")}/></ChartCard><ChartCard title={t("chart-top-articles-claps")}><TopArticlesChart data={data.topByClaps.map(a=>({slug:a.slug,value:a.claps}))} color="#f59e0b" label={t("toggle-show-claps")}/></ChartCard><ChartCard title={t("chart-top-articles-rate")}><TopArticlesChart data={data.topByClapRate.map(a=>({slug:a.slug,value:Math.round(a.clapRate*10)/10}))} color="#10b981" label="%"/></ChartCard></div><ChartCard title={t("tab-content")}><ArticlesTable articles={data.articles}/></ChartCard></div>
                            case "audience": return <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><ChartCard title={t("chart-language-breakdown")}><LanguageBreakdownChart languageMap={data.languageMap}/></ChartCard><ChartCard title={t("lang-match-title")}><p className="text-xs text-foreground/50 mb-3">{t("lang-match-description")}</p><LanguageMatchChart matched={data.languageMatch.matched} unmatched={data.languageMatch.unmatched}/><p className="text-xs text-foreground/40 mt-2">{t("lang-match-blog-langs")}: zh-CN, zh, en</p></ChartCard></div><ChartCard title={t("chart-language-breakdown")}><div className="flex flex-wrap gap-1.5">{Object.entries(data.languageMap).sort(([,a],[,b])=>b-a).map(([lang,count])=>(<div key={lang} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${["zh-CN","zh","en"].includes(lang)||["zh-CN","zh","en"].includes(lang.split("-")[0])?"border-success/20 text-success bg-success/5":"border-foreground/10 text-foreground/60"}`}><span className="font-medium">{lang}</span><span className="tabular-nums">{count.toLocaleString()}</span></div>))}</div></ChartCard></div>
                            case "geography": return <div className="space-y-4"><ChartCard title={t("chart-world-map")}><CountryMapChart countryMap={data.countryMap}/></ChartCard><ChartCard title={t("table-col-country")}><CountryTable countryMap={data.countryMap}/></ChartCard></div>
                            case "technology": return <div className="space-y-4"><ChartCard title={t("chart-device-breakdown")}><DeviceDonutChart deviceMap={data.deviceMap}/></ChartCard><div className="grid grid-cols-3 gap-2">{[{key:"m",label:t("device-mobile"),icon:"📱"},{key:"d",label:t("device-desktop"),icon:"🖥"},{key:"t",label:t("device-tablet"),icon:"📟"}].map(d=>{const count=data.deviceMap[d.key as keyof typeof data.deviceMap]||0;const total=data.deviceMap.m+data.deviceMap.d+data.deviceMap.t;return <Card key={d.key} className="border border-foreground/10"><div className="p-2.5 text-center"><div className="text-lg mb-0.5">{d.icon}</div><div className="text-base font-bold tabular-nums">{count.toLocaleString()}</div><div className="text-xs text-foreground/50">{total>0?((count/total)*100).toFixed(1):"0"}%</div><div className="text-xs text-foreground/60 mt-0.5">{d.label}</div></div></Card>})}</div></div>
                            case "sources": return <div className="space-y-4"><ChartCard title={t("chart-referrer-treemap")}><ReferrerTreemapChart referrerMap={data.referrerMap}/></ChartCard><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><ChartCard title={t("chart-referrer-bar")}><ReferrerBarChart referrerMap={data.referrerMap}/></ChartCard><ChartCard title={t("table-col-referrer")}><ReferrerTable referrerMap={data.referrerMap}/></ChartCard></div></div>
                            case "engagement": return <div className="space-y-4"><ChartCard title={t("chart-hour-heatmap")}><HourHeatmapChart hourlyDistribution={data.hourlyDistribution} weekdayDistribution={data.weekdayDistribution}/></ChartCard><ChartCard title={t("chart-weekday")}><WeekdayChart weekdayDistribution={data.weekdayDistribution}/></ChartCard><ChartCard title={t("chart-clap-distribution")}><ClapsDistributionChart topByClaps={data.topByClaps}/></ChartCard>{Object.keys(data.clapSessionSizes).length>0&&<ChartCard title={t("chart-clap-session-size")}><ClapSessionSizesChart clapSessionSizes={data.clapSessionSizes}/></ChartCard>}</div>
                            case "events": return <div className="space-y-4"><ChartCard title={t("tab-events")}><RecentEventsTable events={data.recentEvents} onRefresh={() => fetch("/api/analytics/data/overview").then(r=>r.json()).then(d=>setData(d))}/></ChartCard></div>
                            default: return null
                        }
                    }}
                </DashboardShell>
            </div>
        </div>
    )
}
