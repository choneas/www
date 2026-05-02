"use client"

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { triggerNavigationLoading } from "@/components/navigation-loader";
import { navItems } from "@/constants/navbar";

interface NavbarItemsProps {
    /** Current active path (may be pending navigation target) */
    pathname: string;
    translations: Record<string, string>;
    /** Callback when user initiates navigation (before it completes) */
    onPendingNavigation?: (path: string) => void;
}

/**
 * NavbarItems client component
 * Displays desktop navigation links with hover expansion
 * Uses pending navigation to update active state immediately
 */
export function NavbarItems({ pathname, translations, onPendingNavigation }: NavbarItemsProps) {
    const router = useRouter();
    const currentPathname = usePathname();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [collapseTimeout, setCollapseTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleNavigation = (href: string) => {
        // Notify parent of pending navigation immediately
        // This allows navbar layout to update before navigation completes
        onPendingNavigation?.(href);

        // Only trigger loading if navigating to a different page
        if (currentPathname !== href) {
            triggerNavigationLoading(href);
        }
        router.push(href);
    };

    const handleExpand = (index: number) => {
        if (collapseTimeout) {
            clearTimeout(collapseTimeout);
            setCollapseTimeout(null);
        }
        setExpandedIndex(index);
    };

    const handleCollapse = () => {
        if (collapseTimeout) {
            clearTimeout(collapseTimeout);
        }
        const timeout = setTimeout(() => {
            setExpandedIndex(null);
            setCollapseTimeout(null);
        }, 250);
        setCollapseTimeout(timeout);
    };

    useEffect(() => {
        return () => {
            if (collapseTimeout) {
                clearTimeout(collapseTimeout);
            }
        };
    }, [collapseTimeout]);

    return (
        <div className="flex items-center gap-1 px-0.5">
            {navItems.map((item, index) => {
                // Check if this item matches the active path (including pending navigation)
                const isActive = pathname === "/"
                    ? false  // No item is active on Home
                    : pathname.includes(item.href);
                const isExpanded = expandedIndex === index;

                // Use filled icon only when on active page
                const currentIcon = isActive ? item.icon.filled : item.icon.outline;

                return (
                    <Button
                        key={item.href}
                        variant="ghost"
                        onPress={() => handleNavigation(item.href)}
                        onHoverStart={() => handleExpand(index)}
                        onHoverEnd={handleCollapse}
                        onFocus={() => handleExpand(index)}
                        onBlur={handleCollapse}
                        className={`h-11 p-4 min-h-0 min-w-0 text-accent rounded-full whitespace-nowrap outline-none transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent_92%)] ${isActive ? "font-bold" : ""}`}
                    >
                        <motion.div
                            className="flex items-center justify-center"
                            initial={false}
                            animate={{ gap: isExpanded ? "8px" : "0px" }}
                            transition={{
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                        >
                            <motion.span
                                className="shrink-0 flex items-center justify-center text-accent"
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                }}
                                transition={{
                                    duration: 0.2,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                            >
                                {currentIcon}
                            </motion.span>
                            <motion.span
                                initial={{ width: 0, opacity: 0 }}
                                animate={{
                                    width: isExpanded ? "auto" : 0,
                                    opacity: isExpanded ? 1 : 0
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                className="inline-block overflow-hidden whitespace-nowrap"
                            >
                                {translations[item.name]}
                            </motion.span>
                        </motion.div>
                    </Button>
                );
            })}
        </div>
    );
}
