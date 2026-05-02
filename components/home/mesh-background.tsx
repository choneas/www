"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { MeshGradient } from "@paper-design/shaders-react";

// Theme-specific gradient colors
const GRADIENT_COLORS = {
    light: ["#fff8f6", "#ffdad4", "#FCEAE7", "#ffb4a8"] as string[],
    dark: ["#1a1110", "#2d1f1d", "#251a19", "#3d2520"] as string[],
};

/**
 * Responsive mesh gradient background with theme support
 * Only renders one instance based on screen size to avoid double rendering
 */
export function MeshBackground() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check initial screen size
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();

        // Listen for resize
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Avoid hydration mismatch
    if (!mounted) {
        return <div className="fixed inset-0 -z-20 bg-background" />;
    }

    const colors = resolvedTheme === "dark" ? GRADIENT_COLORS.dark : GRADIENT_COLORS.light;

    // Render only one MeshGradient based on screen size
    return (
        <div className="fixed inset-0 -z-20">
            {isMobile ? (
                // Mobile: 1/4 resolution for performance
                <MeshGradient
                    width="50%"
                    height="50%"
                    colors={colors}
                    distortion={0.7}
                    speed={0.5}
                    grainMixer={0.4}
                    style={{ transform: "scale(2)", transformOrigin: "top left" }}
                />
            ) : (
                // Desktop: full resolution
                <MeshGradient
                    width="100%"
                    height="100%"
                    colors={colors}
                    distortion={0.7}
                    speed={0.5}
                    grainMixer={0.7}
                />
            )}
        </div>
    );
}
