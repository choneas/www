"use client"

import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { OverlayScrollbarsInit } from "@/components/overlay-scrollbars";
import { NavigationLoader } from "@/components/navigation-loader";
import { Toast } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <OverlayScrollbarsInit />
            <Suspense fallback={null}>
                <NavigationLoader />
            </Suspense>
            <Toast.Provider 
                placement="bottom" 
                maxVisibleToasts={1} 
                className="[&_.toast]:border [&_.toast]:border-border"
            />
            {children}
        </ThemeProvider>
    )
}
