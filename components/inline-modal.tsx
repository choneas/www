"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, Modal, ScrollShadow } from "@heroui/react";
import type { ReactNode } from "react";

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

const fluidSlideAnimation = {
    backdrop: [
        "data-[entering]:duration-500",
        "data-[entering]:ease-[cubic-bezier(0.25,1,0.5,1)]",
        "data-[exiting]:duration-250",
        "data-[exiting]:ease-[cubic-bezier(0.7,0,0.84,0)]",
    ].join(" "),
    container: [
        "data-[entering]:animate-in",
        "data-[entering]:fade-in-0",
        "data-[entering]:slide-in-from-bottom-4",
        "data-[entering]:duration-500",
        "data-[entering]:ease-[cubic-bezier(0.25,1,0.5,1)]",
        "data-[exiting]:animate-out",
        "data-[exiting]:fade-out-0",
        "data-[exiting]:slide-out-to-bottom-2",
        "data-[exiting]:duration-250",
        "data-[exiting]:ease-[cubic-bezier(0.7,0,0.84,0)]",
    ].join(" "),
} as const;

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
                style={{ whiteSpace: "normal", wordBreak: "break-word" }}
            >
                {children}
            </button>

            <Modal.Backdrop
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                className={`${fluidSlideAnimation.backdrop} ${backdropClassName || "bg-linear-to-t from-foreground/70 via-accent/20 to-transparent"}`}
                variant={backdropVariant}
                isDismissable={isDismissable}
                isKeyboardDismissDisabled={isKeyboardDismissDisabled}
            >
                <Modal.Container className={fluidSlideAnimation.container}>
                    <Modal.Dialog
                        aria-label={titleString}
                        className={cn(dialogClassName, "overflow-hidden pt-0 px-0 md:min-w-3xl relative max-h-180")}
                    >
                        {!hideCloseButton && (
                            <Modal.CloseTrigger className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 transition-colors rounded-full" />
                        )}
                        <ScrollShadow className="max-h-[80vh]" hideScrollBar>
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
                        </ScrollShadow>

                        {closeButton && (
                            <Modal.Footer className="absolute bottom-0 left-0 right-0 flex justify-center p-6 bg-linear-to-t from-background via-background/90 to-transparent">
                                {closeButton}
                            </Modal.Footer>
                        )}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
}

export type { InlineModalProps, InlineModalImageProps };
