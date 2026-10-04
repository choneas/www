// ============================================================================
// Layout Configuration
// Sync with page.tsx GridLines for Home alignment
// ============================================================================

export const LAYOUT = {
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

export const TRANSITIONS = {
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
export const TAP_CONFIG = {
    scale: 0.97,
    transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 20,
        mass: 0.6,
    },
} as const;
