import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, getLocale } from "next-intl/server";
import { cn } from "@heroui/react";

import { GlassPanel } from "@/components/home/glass-panel";
import { MomentList, MomentListSkeleton } from "@/components/moment-list";
import { LiveCounter } from "@/components/home/live-counter";
import { MeshBackground } from "@/components/home/mesh-background";
import { SecondParagraphWithModal } from "@/components/home/second-paragraph-modal";
import { techStacks } from "@/constants/about";
import { rt } from "@/utils/rich-text";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata");
    return {
        title: { absolute: t("title") },
        description: t("description"),
        openGraph: {
            title: t("title"),
            description: t("description"),
            type: 'website',
            url: '/',
        },
        twitter: {
            card: 'summary_large_image',
            title: t("title"),
            description: t("description"),
        },
    }
}

// ============================================================================
// Grid System
// ============================================================================

const GRID = {
    thickness: 2,
    color: "bg-accent/10",
} as const;

export { GRID };

/** Vertical grid line */
function VLine({position, className = ""}: { position: "left" | "right"; className?: string }) {
    const pos = position === "left"
        ? "left-4 md:left-16 lg:left-20"
        : "right-4 md:right-16 lg:right-20";
    return (
        <div
            className={cn("fixed top-0 bottom-0 z-39 pointer-events-none", pos, GRID.color, className)}
            style={{width: GRID.thickness}}
        />
    );
}

/** Fixed horizontal line for navbar area - desktop only */
function HLineFixed({className = ""}: { className?: string }) {
    return (
        <div
            className={cn("fixed left-0 w-screen z-39 pointer-events-none hidden md:block", GRID.color, className)}
            style={{height: GRID.thickness}}
        />
    );
}

/** Horizontal grid line - spans full viewport width */
export function HLine({className = ""}: { className?: string }) {
    return (
        <div
            className={cn(
                "absolute w-screen z-39 pointer-events-none",
                "-left-6 md:-left-16 lg:-left-20",
                GRID.color,
                className,
            )}
            style={{height: GRID.thickness}}
        />
    );
}


// ============================================================================
// Components
// ============================================================================

/** Icon links - social & tech stack */
function IconLinks() {
    const allLinks = [
        // ...socialLinks.filter(l => l.href),
        ...techStacks.filter(s => s.href),
    ];

    return (
        <div className="flex flex-wrap gap-3 md:gap-5 justify-center">
            {allLinks.map((item) => (
                <a
                    aria-label={item.name}
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/40 hover:text-foreground/80 transition-colors text-lg md:text-xl lg:text-2xl"
                >
                    {item.icon}
                </a>
            ))}
        </div>
    );
}

async function DynamicLiveCounter() {
    await connection();
    const locale = await getLocale();
    const t = await getTranslations("LiveCounter");

    const birthDate = process.env.BIRTH_DATE || "2010-01-01";

    const randomOffset = Math.floor(Math.random() * 1760) - 880;
    const date = new Date(birthDate);
    date.setDate(date.getDate() + randomOffset);

    return <LiveCounter birthDate={date.toISOString().split("T")[0]} locale={locale} title={t("title")}/>;
}

// ============================================================================
// Page
// ============================================================================

export default async function Home() {
    const t = await getTranslations("Home");

    return (
        <>
            <MeshBackground/>

            <VLine className="invisible md:visible" position="left"/>
            <VLine className="invisible md:visible" position="right"/>

            <HLineFixed className="invisible md:visible top-5 z-40"/>
            <HLineFixed className="invisible md:visible top-24"/>

            <HLine className="invisible md:visible left-0 mt-4 md:hidden"/>

            {/* Hero */}
            <section id="main-content"
                     className="main-content relative min-h-screen flex flex-col px-6 md:px-16 lg:px-20">
                {/* First paragraph */}
                <div
                    className="relative flex-1 flex flex-col justify-center pt-[40vh] pb-10 md:pb-0 md:flex-none md:pt-[10vh] md:min-h-[85vh]">
                    <HLine className="invisible md:visible top-[16vh] md:top-0"/>

                    <p className="text-glass-bg text-[1.4rem] lg:text-3xl text-foreground/85 leading-relaxed max-w-[85vw] md:max-w-4xl -mt-16 md:pt-2 pl-2 md:pl-6">
                        {t.rich("intro.paragraph1", rt())}
                    </p>

                    <div className="pl-2 md:pl-6 mt-6">
                        <Suspense fallback={<p className="text-accent/60">...</p>}>
                            <DynamicLiveCounter/>
                        </Suspense>
                    </div>
                </div>

                {/* Icons */}
                <div className="relative">
                    <HLine className="invisible md:visible top-0"/>
                    <GlassPanel className="px-4 py-8 max-w-[85vw] md:max-w-[100vw]">
                        <IconLinks/>
                    </GlassPanel>
                    <HLine className="invisible md:visible bottom-0"/>
                </div>

                {/* Second paragraph */}
                <div className="relative my-16 md:my-16">
                    <SecondParagraphWithModal
                        beforeCulture={t.rich("intro.paragraph2.before", rt())}
                        cultureText={t("intro.paragraph2.culture")}
                        betweenCultureAndLink={t.rich("intro.paragraph2.middle", rt())}
                        linkText={t.rich("intro.paragraph2.link", rt({
                            a: (chunks) => (
                                <a href={t("intro.paragraph2.linkHref")}
                                   className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors">
                                    {chunks}
                                </a>
                            )
                        }))}
                        afterLink={t("intro.paragraph2.after")}
                        modal={{
                            title: t("modal.title"),
                            paragraphs: [
                                t.rich("modal.paragraph1", rt()),
                                t.rich("modal.paragraph2", rt()),
                                t.rich("modal.paragraph3", rt()),
                            ],
                        }}
                    />
                </div>
            </section>

            {/* Section separator line */}
            <HLine className="relative left-0 md:left-0 lg:left-0"/>

            {/* Moments Section */}
            <section className="relative">
                <div className="relative z-40 md:z-auto lg:px-20">
                    <Suspense fallback={<MomentListSkeleton/>}>
                        <MomentList sortOrder="desc"/>
                    </Suspense>
                </div>
            </section>

            <HLine className="relative left-0 md:left-0 lg:left-0"/>

            {/* Third paragraph - moved after moments */}
            <section className="relative px-6 md:px-16 lg:px-20 py-16 md:py-24">
                <div className="relative">
                    <p className="text-glass-bg text-xl lg:text-2xl text-foreground/85 leading-relaxed max-w-[85vw] md:max-w-4xl px-2 md:px-6">
                        {t.rich("intro.paragraph3", rt())}
                    </p>
                </div>
            </section>

            <HLine className="invisible md:visible relative left-0 md:left-0 lg:left-0"/>

            <div className="h-6"/>
        </>
    );
}
