"use client";

import Link from "next/link";
import { InlineModal } from "@/components/inline-modal";

interface SecondParagraphModalProps {
    beforeCulture: React.ReactNode;
    cultureText: React.ReactNode;
    betweenCultureAndLink: React.ReactNode;
    linkText: React.ReactNode;
    afterLink: React.ReactNode;
    modal: {
        title: React.ReactNode;
        paragraphs: React.ReactNode[];
    };
}

export function SecondParagraphWithModal({
    beforeCulture,
    cultureText,
    betweenCultureAndLink,
    linkText,
    afterLink,
    modal,
}: SecondParagraphModalProps) {
    return (
        <span className="text-glass-bg text-[1.4rem] lg:text-2xl text-foreground/85 leading-relaxed max-w-[85vw] md:max-w-4xl px-2 md:px-6 block">
            {beforeCulture}
            <InlineModal
                modal={modal}
                modalProps={{
                    dialogClassName: "dark"
                }}
                className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
            >
                {cultureText}
            </InlineModal>
            {betweenCultureAndLink}
            <Link
                href="/article"
                className="text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
            >
                {linkText}
            </Link>
            {afterLink}
        </span>
    );
}