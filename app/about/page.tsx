import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { InlineModal } from "@/components/inline-modal";
import { plainText, richText } from "@/utils/rich-text";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("About");
    return {
        title: t("title"),
        description: plainText(t.raw("description")),
        openGraph: {
            title: t("title"),
            description: plainText(t.raw("description")),
            type: 'website',
            url: '/about',
        },
        twitter: {
            card: 'summary_large_image',
            title: t("title"),
            description: plainText(t.raw("description")),
        },
    };
}

export default async function About() {
    const locale = await getLocale();
    const t = await getTranslations("About");
    const tr = richText(t, {
        a: (chunks: ReactNode, options?: { href?: string }) =>
            options?.href ? (
                <a href={options.href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
                    {chunks}
                </a>
            ) : (
                <span className="text-accent underline underline-offset-4">
                    {chunks}
                </span>
            ),
    });

    return (
        <main id="main-content" className="main-content container mx-auto px-8 sm:px-24">
            <div className="pt-[40vh] mb-12">
                <p className={`font-light${ locale !== "zh-CN" ? " text-2xl md:text-3xl leading-relaxed max-w-3xl lg:max-w-5xl" : " text-3xl md:text-4xl"}`}>{tr("tldr")}</p>
            </div>

            <div className={`space-y-6 mb-16${locale !== "zh-CN" ? " mt-12 md:mt-24" : " mt-20 md:mt-40"}`}>
                <p className="text-xl md:text-2xl text-foreground/85 leading-relaxed">
                    {tr("description")}
                </p>
            </div>

            <section className="space-y-6 mb-16">
                <h1 className="max-w-4xl">{t("title")}</h1>
                <p className="text-xl md:text-2xl leading-relaxed">
                    {tr("paragraph.before")}
                    <InlineModal modal={{
                        title: t("modal.paragraph.title"),
                        paragraphs: [tr("modal.paragraph.paragraph1"), tr("modal.paragraph.paragraph2")],
                    }}>
                        <span className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors cursor-pointer">
                            {t("paragraph.link")}
                        </span>
                    </InlineModal>
                    {tr("paragraph.after")}
                </p>
            </section>

            <section className="space-y-6 mb-16">
                <h2>{t("subtitle1")}</h2>
                <p className="text-xl md:text-2xl leading-relaxed">
                    {tr("paragraph1.before")}
                    <InlineModal
                        modal={{
                            title: t("modal.paragraph1.title"),
                            paragraphs: [tr("modal.paragraph1.paragraph1"), tr("modal.paragraph1.paragraph2")],
                            image: {
                                src: "/images/infp-bg.webp",
                                alt: t("paragraph1.imageAlt"),
                            },
                        }}
                        modalProps={{
                            dialogClassName: ""
                        }}
                    >
                        <span className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors cursor-pointer whitespace-normal wrap-break-word">
                            {t("paragraph1.link")}
                        </span>
                    </InlineModal>
                    {tr("paragraph1.after")}
                </p>
            </section>

            <section className="space-y-6 mb-16">
                <h2>{t("subtitle2")}</h2>
                <p className="text-xl md:text-2xl leading-relaxed">{tr("paragraph2")}</p>
            </section>

            <section className="space-y-6 -mb-16 text-center mx-auto md:max-w-2xl">
                <h2>{t("subtitle3")}</h2>
                <p className="text-foreground/85 leading-relaxed">{tr("paragraph3")}</p>
            </section>
        </main>
    );
}
