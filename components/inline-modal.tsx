"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@heroui/react";
import type { ReactNode } from "react";
import { ModalShell, ModalScrollBody } from "@/components/modal-shell";

interface InlineModalImageProps {
    src?: string;
    alt?: string;
    className?: string;
}

interface InlineModalProps {
    children: ReactNode;
    modal: {
        title: ReactNode;
        paragraphs: ReactNode[];
        image?: InlineModalImageProps;
    };
    className?: string;
    modalProps?: {
        backdropClassName?: string;
        backdropVariant?: "opaque" | "blur" | "transparent";
        isDismissable?: boolean;
        isKeyboardDismissDisabled?: boolean;
        dialogClassName?: string;
        hideCloseButton?: boolean;
        closeButton?: ReactNode;
    };
}

export function InlineModal({ children, modal, className = "", modalProps }: InlineModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { title, paragraphs, image: imageInfo } = modal;

    const image = {
        src: imageInfo?.src || "/images/landscape.webp",
        alt: imageInfo?.alt || "Landscape",
        className: imageInfo?.className || "",
    };

    const titleString = typeof title === "string" ? title : "";

    const {
        backdropClassName,
        backdropVariant = "blur",
        isDismissable = true,
        isKeyboardDismissDisabled = false,
        dialogClassName,
        hideCloseButton = false,
        closeButton,
    } = modalProps || {};

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`inline bg-transparent border-none p-0 font-inherit whitespace-normal break-words box-decoration-clone cursor-pointer ${className}`}
            >
                {children}
            </button>

            <ModalShell
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                label={titleString}
                backdropClassName={backdropClassName}
                backdropVariant={backdropVariant}
                isDismissable={isDismissable}
                isKeyboardDismissDisabled={isKeyboardDismissDisabled}
                dialogClassName={cn(dialogClassName, "overflow-hidden pt-0 px-0 md:min-w-3xl relative max-h-180")}
                hideCloseButton={hideCloseButton}
                footer={closeButton}
            >
                <ModalScrollBody>
                    <div className="relative w-full h-48 md:h-64">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                            className={`object-cover ${image.className}`}
                            quality={75}
                        />
                        <div className="absolute dark inset-0 bg-linear-to-t from-background/60 to-transparent" />
                        <div className="absolute dark bottom-4 left-6 right-16">
                            <h2 className="text-2xl md:text-3xl font-bold text-muted mix-blend-plus-lighter drop-shadow-lg">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="p-6 pb-20 space-y-4">
                        {paragraphs.map((paragraph, index) => (
                            <div key={index} className="text-foreground leading-relaxed text-xl">
                                {paragraph}
                            </div>
                        ))}
                    </div>
                </ModalScrollBody>
            </ModalShell>
        </>
    );
}

export type { InlineModalProps, InlineModalImageProps };
