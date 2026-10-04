// Shared ECharts palette for the analytics dashboard.
// Views = indigo, claps = amber, rate = emerald. The same metric
// keeps the same color in every chart.

export const CHART_COLORS = {
    views: "#6366f1",
    claps: "#f59e0b",
    rate: "#10b981",
    danger: "#ef4444",
    violet: "#8b5cf6",
    cyan: "#06b6d4",
    pink: "#ec4899",
    orange: "#f97316",
    gray: "#6b7280",
    muted: "#888",
} as const;

export const CHART_SERIES_COLORS: string[] = [
    CHART_COLORS.views,
    CHART_COLORS.claps,
    CHART_COLORS.rate,
    CHART_COLORS.danger,
    CHART_COLORS.violet,
    CHART_COLORS.cyan,
    CHART_COLORS.pink,
    CHART_COLORS.orange,
    CHART_COLORS.gray,
];

interface RampStop {
    offset: number;
    color: string;
}

export const VIEWS_AREA_RAMP: RampStop[] = [
    { offset: 0, color: "rgba(99,102,241,0.3)" },
    { offset: 1, color: "rgba(99,102,241,0.02)" },
];

export const CLAPS_AREA_RAMP: RampStop[] = [
    { offset: 0, color: "rgba(245,158,11,0.3)" },
    { offset: 1, color: "rgba(245,158,11,0.02)" },
];

export const MAP_RAMP: string[] = [
    "rgba(99,102,241,0.1)",
    "rgba(99,102,241,0.3)",
    "rgba(99,102,241,0.6)",
    "rgba(99,102,241,0.9)",
];

export const HEAT_RAMP: string[] = [
    "rgba(99,102,241,0.1)",
    "rgba(99,102,241,0.4)",
    "rgba(99,102,241,0.9)",
];
