import { motion, useTransform, MotionValue } from "framer-motion";
import { TRANSITIONS } from "./layout-config";

// ============================================================================
// Style Helpers
// ============================================================================

/** Glass effect styles for navbar islands */
export function getIslandStyle(isMenuOpen: boolean) {
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
export function useOceanEffect(scrollY: MotionValue<number>, disabled: boolean) {
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
export function OceanLayer({ backdropFilter, background }: OceanLayerProps) {
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
export function Overlay({ onClose }: OverlayProps) {
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
