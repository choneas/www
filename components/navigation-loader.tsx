"use client"

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner, Skeleton } from "@heroui/react";

interface NavigationState {
    isLoading: boolean;
    targetPath: string | null;
    hasCover: boolean;
    hasIcon: boolean;
}

const TRANSITION_EASE = [0.76, 0, 0.24, 1] as const;

const OVERLAY_ENTER = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: {
        opacity: 0,
        scale: 1.02,
        filter: "blur(4px)",
        transition: { duration: 0.45, ease: TRANSITION_EASE },
    },
} as const;

const CONTENT_ENTER = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: 0.1, ease: TRANSITION_EASE },
} as const;

/**
 * Global navigation loading overlay
 * Shows route-specific skeleton or generic spinner during page transitions
 */
export function NavigationLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [state, setState] = useState<NavigationState>({
        isLoading: false,
        targetPath: null,
        hasCover: false,
        hasIcon: false,
    });

    useEffect(() => {
        setState({ isLoading: false, targetPath: null, hasCover: false, hasIcon: false });
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleNavigationStart = (e: CustomEvent<{ targetPath?: string; hasCover?: boolean; hasIcon?: boolean }>) => {
            setState({
                isLoading: true,
                targetPath: e.detail?.targetPath || null,
                hasCover: e.detail?.hasCover ?? false,
                hasIcon: e.detail?.hasIcon ?? false,
            });
        };

        window.addEventListener("navigation-start", handleNavigationStart as EventListener);
        return () => {
            window.removeEventListener("navigation-start", handleNavigationStart as EventListener);
        };
    }, []);

    const SkeletonContent = getSkeletonForPath(state.targetPath);

    return (
        <AnimatePresence mode="wait">
            {state.isLoading && (
                <motion.div
                    key="nav-loading-overlay"
                    className="fixed inset-0 z-41 bg-background overflow-hidden"
                    {...OVERLAY_ENTER}
                >
                    {SkeletonContent ? (
                        <motion.div {...CONTENT_ENTER}>
                            <SkeletonContent hasCover={state.hasCover} hasIcon={state.hasIcon} />
                        </motion.div>
                    ) : (
                        <DefaultLoadingSpinner />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Default loading spinner for routes without custom skeleton
 */
function DefaultLoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.15 }}
            >
                <Spinner size="lg" color="accent" />
            </motion.div>
        </div>
    );
}

/**
 * Article list page skeleton
 */
function ArticleListSkeleton(_props: { hasCover: boolean; hasIcon: boolean }) {
    return (
        <main className="container mx-auto px-8 sm:mt-20 sm:px-24 pt-8">
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-9 w-80 mt-2 rounded-lg" />

            <div className="mt-8">
                <Skeleton className="h-9 w-full rounded-full" />

                <div className="flex gap-3 mt-4 overflow-hidden">
                    {[70, 90, 60, 80, 75, 85].map((width, i) => (
                        <Skeleton
                            key={i}
                            className="h-10 rounded-full shrink-0"
                            style={{ width: `${width}px` }}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

/**
 * Article detail page skeleton — mimics PostHeader + content layout
 */
function ArticleDetailSkeleton({ hasCover, hasIcon }: { hasCover: boolean; hasIcon: boolean }) {
    return (
        <main>
            {hasCover && (
                <div className="relative -mt-[72px] max-w-screen overflow-hidden mb-3">
                    <Skeleton className="md:h-[50vh] h-[80vh] w-full rounded-none" />
                </div>
            )}

            <div className={hasCover
                ? "max-w-6xl mx-auto px-8 sm:px-24 md:px-48 pt-8 pb-4"
                : "max-w-6xl mx-auto px-8 sm:mt-20 sm:px-24 md:px-48 pt-8 pb-4"
            }>
                <div className="flex gap-2 mb-3">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-14 rounded-full" />
                </div>

                {hasIcon && (
                    <Skeleton className="h-14 w-14 rounded-lg mb-2" />
                )}

                <Skeleton className="h-10 w-3/4 rounded-lg mb-3" />
                <Skeleton className="h-10 w-1/2 rounded-lg mb-4" />

                <Skeleton className="h-5 w-48 rounded-lg" />
            </div>

            <div className="max-w-6xl mx-auto px-8 sm:px-24 md:px-48 mt-8">
                <Skeleton className="h-5 w-full rounded mb-3" />
                <Skeleton className="h-5 w-11/12 rounded mb-3" />
                <Skeleton className="h-5 w-4/5 rounded mb-3" />
                <Skeleton className="h-5 w-full rounded mb-3" />
                <Skeleton className="h-5 w-3/4 rounded mb-8" />

                <Skeleton className="h-5 w-full rounded mb-3" />
                <Skeleton className="h-5 w-5/6 rounded mb-3" />
                <Skeleton className="h-5 w-full rounded mb-3" />
                <Skeleton className="h-5 w-2/3 rounded mb-8" />

                <Skeleton className="h-5 w-full rounded mb-3" />
                <Skeleton className="h-5 w-4/5 rounded mb-3" />
                <Skeleton className="h-5 w-full rounded mb-3" />
            </div>
        </main>
    );
}

interface SkeletonProps {
    hasCover: boolean;
    hasIcon: boolean;
}

/**
 * Route to skeleton mapping
 */
function getSkeletonForPath(path: string | null): React.ComponentType<SkeletonProps> | null {
    if (!path) return null;

    if (path === "/article" || path.startsWith("/article?")) {
        return ArticleListSkeleton;
    }

    if (path.startsWith("/article/")) {
        return ArticleDetailSkeleton;
    }

    return null;
}

/**
 * Trigger navigation loading state
 * @param targetPath - Optional target path for route-specific skeleton
 */
export function triggerNavigationLoading(targetPath?: string, meta?: { hasCover?: boolean; hasIcon?: boolean; source?: string }) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("navigation-start", {
            detail: { targetPath, ...meta }
        }));
    }
}
