"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { NavbarContext } from "@/components/navbar/context";
import { NavbarBrand } from "@/components/navbar/brand";
import { NavbarItems } from "@/components/navbar/items";
import { NavbarDropdown } from "@/components/navbar/dropdown";
import { NavbarMobileMenu } from "@/components/navbar/mobile-menu";
import { LAYOUT, TRANSITIONS, TAP_CONFIG } from "./layout-config";
import { getIslandStyle, useOceanEffect, OceanLayer, Overlay } from "./ocean";

interface NavbarProps {
    translations: Record<string, string>;
    supportedLocales: string[];
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

    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const effectivePath = pendingPath ?? pathname;
    const isHome = effectivePath === "/";
    const isMenuOpen = isDropdownOpen || isMobileMenuOpen;

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

    const ocean = useOceanEffect(scrollY, isMenuOpen);

    const islandStyle = useMemo(() => getIslandStyle(isMenuOpen), [isMenuOpen]);

    // Per-island glow — sweeps a focused light beam around the border edge
    const getIslandGlowClass = (island: 'brand' | 'items' | 'mobile') => {
        if (glowingIsland !== island) return "";
        const phaseClass = glowPhase === 'fast' ? ' glow-fast' : ' glow-normal';
        return isFadingOut ? ` navbar-island-glow${phaseClass} fading` : ` navbar-island-glow${phaseClass}`;
    };


    const contextValue = useMemo(() => ({
        scrollY,
        navbarBlur: ocean.blur,
        pathname: effectivePath,
    }), [scrollY, ocean.blur, effectivePath]);

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
                        tabIndex={-1}
                        className={`absolute flex items-center h-14 rounded-full pl-3 pr-4 navbar-island navbar-island-single${getIslandGlowClass('brand')}`}
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
                        tabIndex={-1}
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
                        tabIndex={-1}
                        className="absolute flex items-center justify-center h-14 w-14 rounded-full p-0 navbar-island navbar-island-single"
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
                        tabIndex={-1}
                        className={`relative flex items-center justify-center h-14 w-14 rounded-full p-0 shrink-0 navbar-island navbar-island-single${getIslandGlowClass('mobile')}`}
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
                        tabIndex={-1}
                        className={`relative flex items-center h-14 rounded-full pl-3 pr-4 navbar-island navbar-island-single${getIslandGlowClass('brand')}`}
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
                        tabIndex={-1}
                        className="relative flex items-center justify-center h-14 w-14 rounded-full p-0 shrink-0 navbar-island navbar-island-single"
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
