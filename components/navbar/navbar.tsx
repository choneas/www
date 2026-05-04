"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { usePathname } from "next/navigation";
import { NavbarContext } from "@/components/navbar/navbar-context";
import { NavbarBrand } from "@/components/navbar/navbar-brand";
import { NavbarItems } from "@/components/navbar/navbar-items";
import { NavbarDropdown } from "@/components/navbar/navbar-dropdown";
import { NavbarMobileMenu } from "@/components/navbar/navbar-mobile-menu";

interface NavbarProps {
    translations: Record<string, string>;
    supportedLocales: string[];
}

// ============================================================================
// Layout Configuration
// Sync with page.tsx GridLines for Home alignment
// ============================================================================

const LAYOUT = {
    desktop: {
        top: 16,
        homeTop: 32,
        sideInset: 96,
        normalSideInset: 128,
    },
    mobile: {
        bottom: 16,
        sideInset: 16,
    },
} as const;

// ============================================================================
// Animation Configuration
// ============================================================================

const TRANSITIONS = {
    layout: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
    },
    island: {
        type: "spring" as const,
        stiffness: 200,
        damping: 25,
        mass: 1,
    },
    // Mobile: no position animation, instant
    mobileIsland: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
    },
    overlay: { duration: 0.2 },
} as const;

// Refined tap animation configuration
// Uses precise spring physics for tactile feedback on both press and release
const TAP_CONFIG = {
    scale: 0.97,
    transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 20,
        mass: 0.6,
    },
} as const;

// ============================================================================
// Style Helpers
// ============================================================================

/** Glass effect styles for navbar islands */
function getIslandStyle(isMenuOpen: boolean) {
    const blur = isMenuOpen ? "blur(20px) saturate(180%)" : "blur(18px) saturate(160%)";
    const bg = isMenuOpen
        ? "color-mix(in srgb, var(--color-background) 96%, transparent 4%)"
        : "color-mix(in srgb, color-mix(in srgb, var(--color-background) 90%, var(--color-accent) 10%) 80%, transparent 20%)";

    return {
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        backgroundColor: bg,
    };
}

/** Ocean blur layer hook - handles scroll-based blur effect */
function useOceanEffect(scrollY: MotionValue<number>, disabled: boolean) {
    const blur = useTransform(scrollY, [0, 400], [0, 16]);
    const saturate = useTransform(scrollY, [0, 400], [100, 150]);
    const opacity = useTransform(scrollY, [0, 400], [0, 10]);

    const backdropFilter = useTransform(
        [blur, saturate],
        ([b, s]) => `blur(${b}px) saturate(${s}%)`
    );
    const background = useTransform(
        opacity,
        (o) => `color-mix(in srgb, transparent ${100 - o}%, var(--color-background) ${o}%)`
    );

    const fixedBackdrop = "blur(16px) saturate(150%)";
    const fixedBackground = "color-mix(in srgb, transparent 90%, var(--color-background) 10%)";

    return {
        blur,
        backdropFilter: disabled ? fixedBackdrop : backdropFilter,
        background: disabled ? fixedBackground : background,
    };
}

// ============================================================================
// Sub-components
// ============================================================================

interface OceanLayerProps {
    backdropFilter: MotionValue<string> | string;
    background: MotionValue<string> | string;
}

/** Gradient blur layer at top (desktop) and bottom (mobile) */
function OceanLayer({ backdropFilter, background }: OceanLayerProps) {
    const maskTop = "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)";
    const maskBottom = "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)";

    return (
        <div className="fixed sm:top-0 bottom-0 sm:bottom-auto inset-x-0 z-40 md:z-39 pointer-events-none h-48 md:h-32">
            {/* Desktop: top gradient */}
            <motion.div
                className="hidden sm:block absolute inset-0"
                style={{
                    backdropFilter,
                    WebkitBackdropFilter: backdropFilter,
                    maskImage: maskTop,
                    WebkitMaskImage: maskTop,
                }}
            />
            <motion.div
                className="hidden sm:block absolute inset-0"
                style={{
                    background,
                    maskImage: maskTop,
                    WebkitMaskImage: maskTop,
                }}
            />
            {/* Mobile: bottom gradient - constant background, no blur */}
            <div
                className="sm:hidden absolute inset-0"
                style={{
                    background: "color-mix(in srgb, var(--color-background) 90%, transparent)",
                    maskImage: maskBottom,
                    WebkitMaskImage: maskBottom,
                }}
            />
        </div>
    );
}

interface OverlayProps {
    onClose: () => void;
}

/** Dark overlay when menu is open */
function Overlay({ onClose }: OverlayProps) {
    return (
        <motion.div
            className="fixed inset-0 z-41 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITIONS.overlay}
            onClick={onClose}
        />
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function Navbar({ translations, supportedLocales }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [glowingIsland, setGlowingIsland] = useState<'brand' | 'items' | 'mobile' | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [glowPhase, setGlowPhase] = useState<'fast' | 'normal'>('normal');
    const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
    const speedTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
    const { scrollY } = useScroll();
    const pathname = usePathname();

    // Pending navigation for immediate UI feedback
    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const effectivePath = pendingPath ?? pathname;
    const isHome = effectivePath === "/";
    const isMenuOpen = isDropdownOpen || isMobileMenuOpen;

    // Clear pending path when navigation completes
    useEffect(() => {
        if (pendingPath && pathname === pendingPath) {
            setPendingPath(null);
        }
    }, [pathname, pendingPath]);

    // Listen for navigation events to activate island glow
    useEffect(() => {
        const handleNavStart = (e: Event) => {
            const detail = (e as CustomEvent<{ source?: string }>).detail;
            if (fadeTimerRef.current) {
                clearTimeout(fadeTimerRef.current);
                fadeTimerRef.current = null;
            }
            if (speedTimerRef.current) {
                clearTimeout(speedTimerRef.current);
                speedTimerRef.current = null;
            }
            setIsFadingOut(false);
            setGlowPhase('fast');
            setGlowingIsland((detail?.source as 'brand' | 'items' | 'mobile') || null);
            speedTimerRef.current = setTimeout(() => {
                setGlowPhase('normal');
                speedTimerRef.current = null;
            }, 650);
        };
        window.addEventListener("navigation-start", handleNavStart);
        return () => window.removeEventListener("navigation-start", handleNavStart);
    }, []);

    // Fade out glow when page loads, then clear entirely
    useEffect(() => {
        if (glowingIsland) {
            setIsFadingOut(true);
            fadeTimerRef.current = setTimeout(() => {
                setGlowingIsland(null);
                setIsFadingOut(false);
                fadeTimerRef.current = null;
            }, 600);
        }
        return () => {
            if (fadeTimerRef.current) {
                clearTimeout(fadeTimerRef.current);
                fadeTimerRef.current = null;
            }
            if (speedTimerRef.current) {
                clearTimeout(speedTimerRef.current);
                speedTimerRef.current = null;
            }
        };
    }, [pathname]);

    const handleNavigationStart = useCallback((path: string) => {
        if (path !== pathname) {
            setPendingPath(path);
        }
    }, [pathname]);

    const closeAllMenus = useCallback(() => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    }, []);

    // Ocean blur effect
    const ocean = useOceanEffect(scrollY, isMenuOpen);

    // Island glass style
    const islandStyle = useMemo(() => getIslandStyle(isMenuOpen), [isMenuOpen]);

    // Per-island glow — sweeps a focused light beam around the border edge
    const getIslandGlowClass = (island: 'brand' | 'items' | 'mobile') => {
        if (glowingIsland !== island) return "";
        const phaseClass = glowPhase === 'fast' ? ' glow-fast' : ' glow-normal';
        return isFadingOut ? ` navbar-island-glow${phaseClass} fading` : ` navbar-island-glow${phaseClass}`;
    };


    // Context for child components
    const contextValue = useMemo(() => ({
        scrollY,
        navbarBlur: ocean.blur,
        pathname: effectivePath,
    }), [scrollY, ocean.blur, effectivePath]);

    // Calculate desktop positioning based on page
    const desktopTop = isHome ? LAYOUT.desktop.homeTop : LAYOUT.desktop.top;
    const sideInset = isHome ? LAYOUT.desktop.sideInset : LAYOUT.desktop.normalSideInset;

    return (
        <NavbarContext.Provider value={contextValue}>
            {isMenuOpen && <Overlay onClose={closeAllMenus} />}

            <OceanLayer
                backdropFilter={ocean.backdropFilter}
                background={ocean.background}
            />

            {/* Desktop Navbar - top positioned */}
            <motion.nav
                className={`hidden sm:block fixed inset-x-0 z-41 pointer-events-auto desktop-nav${isMenuOpen ? ' nav-menu-open' : ''}`}
                initial={false}
                animate={{ top: desktopTop }}
                transition={TRANSITIONS.layout}
            >
                <div className="flex items-center justify-center gap-3 relative h-14 w-full">
                    {/* Brand island - Left */}
                    <motion.div
                        className={`absolute flex items-center h-14 rounded-full pl-3 pr-4 navbar-island${getIslandGlowClass('brand')}`}
                        style={{
                            ...islandStyle,
                            maxWidth: "calc(40vw - 180px)",
                            overflow: "hidden",
                        }}
                        initial={false}
                        animate={{ left: sideInset }}
                        whileTap={{ scale: TAP_CONFIG.scale }}
                        transition={TRANSITIONS.island}
                    >
                        <NavbarBrand />
                    </motion.div>

                    {/* Items island - Center */}
                    <motion.div
                        className={`absolute left-1/2 -translate-x-1/2 flex items-center p-1 h-14 rounded-full overflow-hidden navbar-island${getIslandGlowClass('items')}`}
                        style={islandStyle}
                        initial={false}
                        whileTap={{ scale: TAP_CONFIG.scale }}
                        transition={TRANSITIONS.island}
                    >
                        <NavbarItems
                            pathname={effectivePath}
                            translations={translations}
                            onPendingNavigation={handleNavigationStart}
                        />
                    </motion.div>

                    {/* Dropdown island - Right */}
                    <motion.div
                        className="absolute flex items-center justify-center h-14 w-14 rounded-full p-0 navbar-island"
                        style={islandStyle}
                        initial={false}
                        animate={{ right: sideInset }}
                        whileTap={{ scale: TAP_CONFIG.scale }}
                        transition={TRANSITIONS.island}
                    >
                        <NavbarDropdown
                            supportedLocales={supportedLocales}
                            onVisibilityChange={setIsDropdownOpen}
                        />
                    </motion.div>
                </div>
            </motion.nav>

            {/* Mobile Navbar - always bottom positioned */}
            <nav
                className={`sm:hidden fixed inset-x-0 z-41 pointer-events-auto${isMenuOpen ? ' nav-menu-open' : ''}`}
                style={{ bottom: LAYOUT.mobile.bottom }}
            >
                <div
                    className="mx-auto flex items-center justify-between gap-3"
                    style={{ padding: `0 ${LAYOUT.mobile.sideInset}px` }}
                >
                    <motion.div
                        className={`flex items-center justify-center h-14 w-14 rounded-full p-0 shrink-0 navbar-island${getIslandGlowClass('mobile')}`}
                        style={islandStyle}
                        whileTap={{ scale: TAP_CONFIG.scale }}
                        transition={TAP_CONFIG.transition}
                    >
                        <NavbarMobileMenu
                            isOpen={isMobileMenuOpen}
                            onOpenChange={setIsMobileMenuOpen}
                            pathname={effectivePath}
                            translations={translations}
                        />
                    </motion.div>

                    <motion.div
                        className={`flex items-center h-14 rounded-full pl-3 pr-4 navbar-island${getIslandGlowClass('brand')}`}
                        style={{
                            ...islandStyle,
                            maxWidth: "calc(100vw - 180px)",
                            overflow: "hidden",
                        }}
                        whileTap={{ scale: TAP_CONFIG.scale }}
                        transition={TAP_CONFIG.transition}
                    >
                        <NavbarBrand />
                    </motion.div>

                    <motion.div
                        className="flex items-center justify-center h-14 w-14 rounded-full p-0 shrink-0 navbar-island"
                        style={islandStyle}
                        whileTap={{ scale: TAP_CONFIG.scale }}
                        transition={TAP_CONFIG.transition}
                    >
                        <NavbarDropdown
                            supportedLocales={supportedLocales}
                            onVisibilityChange={setIsDropdownOpen}
                        />
                    </motion.div>
                </div>
            </nav>
        </NavbarContext.Provider>
    );
}
