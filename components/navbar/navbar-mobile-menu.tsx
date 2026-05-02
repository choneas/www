"use client"

import { Dropdown, Label, ListBox } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

import { triggerNavigationLoading } from "@/components/navigation-loader";
import { navItems } from "@/constants/navbar";

interface NavbarMobileMenuProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    pathname: string;
    translations: Record<string, string>;
}

/**
 * NavbarMobileMenu component
 * Mobile navigation menu using HeroUI Dropdown
 * Custom animated hamburger icon that transforms to X
 */
export function NavbarMobileMenu({ isOpen, onOpenChange, pathname, translations }: NavbarMobileMenuProps) {
    const router = useRouter();
    const currentPathname = usePathname();

    const handleNavigation = (href: string) => {
        if (currentPathname !== href) {
            triggerNavigationLoading(href);
        }
        router.push(href);
        onOpenChange(false);
    };

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <Dropdown.Trigger
                className="flex h-14 w-14 items-center justify-center transition-colors relative"
                aria-label="Navigation menu"
            >
                <div className="w-5 h-5 relative flex items-center justify-center">
                    {/* Top line */}
                    <motion.span
                        className="absolute w-5 border-t-2 border-accent"
                        style={{ borderRadius: "999px" }}
                        animate={isOpen ? {
                            rotate: 45,
                            y: 0
                        } : {
                            rotate: 0,
                            y: -3
                        }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    />
                    {/* Bottom line */}
                    <motion.span
                        className="absolute w-5 border-t-2 border-accent"
                        style={{ borderRadius: "999px" }}
                        animate={isOpen ? {
                            rotate: -45,
                            y: 0
                        } : {
                            rotate: 0,
                            y: 3
                        }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    />
                </div>
            </Dropdown.Trigger>

            <Dropdown.Popover
                placement="bottom start"
                className="w-64 px-4 py-4 mobile-dropdown-fix"
            >
                <ListBox
                    aria-label="Navigation"
                    selectionMode="single"
                    onAction={(key) => handleNavigation(String(key))}
                >
                    {navItems.map((item) => {
                        const isActive = pathname.includes(item.href) && pathname !== "/";
                        // Use filled icon when active, outline when inactive
                        const currentIcon = isActive ? item.icon.filled : item.icon.outline;

                        return (
                            <ListBox.Item
                                key={item.href}
                                id={item.href}
                                textValue={translations[item.name]}
                                className={`text-accent ${isActive ? "font-bold" : ""}`}
                            >
                                <span className="text-accent">{currentIcon}</span>
                                <Label className="text-accent">{translations[item.name]}</Label>
                            </ListBox.Item>
                        );
                    })}
                </ListBox>
            </Dropdown.Popover>
        </Dropdown>
    );
}