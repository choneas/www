"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY, THEMES, type ResolvedTheme, type Theme } from "@/utils/theme";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: ResolvedTheme;
    systemTheme: ResolvedTheme;
    themes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") {
        return "light";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
    if (typeof window === "undefined") {
        return "system";
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function applyTheme(theme: Theme, systemTheme = getSystemTheme()) {
    if (typeof document === "undefined") {
        return;
    }

    const resolvedTheme = theme === "system" ? systemTheme : theme;
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.setAttribute("data-theme", resolvedTheme);
    root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme);
    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

    const setTheme = useCallback((nextTheme: Theme) => {
        setThemeState(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }, []);

    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = () => {
            setSystemTheme(getSystemTheme());
        };

        handleChange();
        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        applyTheme(theme, systemTheme);
    }, [theme, systemTheme]);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY) {
                setThemeState(getStoredTheme());
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const value = useMemo<ThemeContextValue>(() => ({
        theme,
        setTheme,
        resolvedTheme: theme === "system" ? systemTheme : theme,
        systemTheme,
        themes: THEMES,
    }), [theme, setTheme, systemTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        return {
            theme: "system" as const,
            setTheme: () => {},
            resolvedTheme: "light" as const,
            systemTheme: "light" as const,
            themes: THEMES,
        };
    }

    return context;
}
