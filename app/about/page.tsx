import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { InlineModal } from "@/components/inline-modal";
import { plainText, richText } from "@/utils/rich-text";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("About");
    const tm = await getTranslations("Metadata");
    return {
        title: t("title") + tm("suffix"),
        description: plainText(t.raw("description")),
    };
}

export default async function About() {
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
                <p className="font-light text-3xl md:text-4xl">{tr("tldr")}</p>
            </div>

            <div className="space-y-6 mt-20 md:mt-40 mb-16">
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

            <section className="space-y-6 -mb-16 text-center">
                <h2>{t("subtitle3")}</h2>
                <p className="text-foreground/85 leading-relaxed">{tr("paragraph3")}</p>
            </section>
        </main>
    );
}
