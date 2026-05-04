"use client"

import { Link } from "@heroui/react";
import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { triggerNavigationLoading } from "@/components/navigation-loader";
import { usePostMetadata } from "@/stores/post";
import { Avatar } from "@/components/avatar";
import { useNavbarContext } from "./navbar-context";

export function NavbarBrand() {
    const tm = useTranslations("Metadata")
    const router = useRouter();
    const currentPathname = usePathname();
    const { postMetadata } = usePostMetadata();
    const { scrollY, pathname } = useNavbarContext();

    const isArticlePage = pathname.includes("article/");

    // Handle navigation with loading trigger
    const handleNavigation = () => {
        if (currentPathname !== "/") {
            triggerNavigationLoading("/", { source: "brand" });
        }
        router.push("/");
    };

    // Text animation values
    const headTextY = useTransform(scrollY, [0, 200], [-6, -15]);
    const contentTextY = useTransform(scrollY, [0, 200], [30, 0]);
    const headTextOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);
    const headTextScale = useTransform(scrollY, [0, 200], [1, 0.8]);
    const contentTextOpacity = useTransform(scrollY, [0, 200], [0, 1]);

    // Measure actual title width
    const titleRef = useRef<HTMLDivElement>(null);
    const [measuredWidth, setMeasuredWidth] = useState(400);

    // Width animation for article title container
    const titleWidth = useMotionValue(80);
    const titleWidthSpring = useSpring(titleWidth, { stiffness: 300, damping: 30 });

    // Measure title width on mount and when title changes
    useEffect(() => {
        if (!isArticlePage || !titleRef.current) return;

        const measureWidth = () => {
            if (titleRef.current) {
                const width = titleRef.current.scrollWidth;
                const maxWidth = Math.min(width + 16, 400);
                setMeasuredWidth(maxWidth);
            }
        };

        measureWidth();
        // Measure again after fonts load
        if (document.fonts) {
            document.fonts.ready.then(measureWidth);
        }
    }, [isArticlePage, postMetadata?.title]);

    useEffect(() => {
        if (!isArticlePage) {
            titleWidth.set(80);
            return;
        }

        // Set initial width based on current scroll position
        const currentScroll = scrollY.get();
        const initialProgress = Math.min(Math.max(currentScroll / 200, 0), 1);
        const initialWidth = 80 + (measuredWidth - 80) * initialProgress;
        titleWidth.set(initialWidth);

        const unsubscribe = scrollY.on("change", (latest) => {
            const progress = Math.min(Math.max(latest / 200, 0), 1);
            const newWidth = 80 + (measuredWidth - 80) * progress;
            titleWidth.set(newWidth);
        });

        return () => unsubscribe();
    }, [scrollY, isArticlePage, titleWidth, measuredWidth]);

    return (
        <Link
            onPress={handleNavigation}
            className="flex gap-3 font-bold text-accent items-center w-full cursor-pointer no-underline"
        >
            <Avatar size="sm" className="shrink-0" />
            {isArticlePage ? (
                <motion.div
                    className="relative h-6"
                    style={{
                        width: titleWidthSpring
                    }}
                >
                    {/* Name text - moves up and scales down */}
                    <motion.div
                        className="absolute left-0 top-2 origin-left whitespace-nowrap overflow-visible font-bold!"
                        translate="no"
                        style={{
                            y: headTextY,
                            opacity: headTextOpacity,
                            scale: headTextScale
                        }}
                    >
                        {tm('name')}
                    </motion.div>
                    {/* Article title - moves up from bottom */}
                    <motion.div
                        ref={titleRef}
                        className="absolute left-0 top-2 right-0 overflow-hidden text-ellipsis whitespace-nowrap"
                        style={{
                            y: contentTextY,
                            opacity: contentTextOpacity
                        }}
                    >
                        {postMetadata?.title}
                    </motion.div>
                </motion.div>
            ) : (
                <p
                    translate="no"
                    className="whitespace-nowrap font-bold!"
                >
                    {tm('name')}
                </p>
            )}
        </Link>
    )
}
