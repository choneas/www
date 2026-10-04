"use client";

import { Modal, ScrollShadow } from "@heroui/react";
import type { ReactNode } from "react";

export const modalAnimation = {
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

export const modalBackdropGradient = "bg-linear-to-t from-foreground/70 via-accent/20 to-transparent";

export function ModalCloseButton() {
    return (
        <Modal.CloseTrigger className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 transition-colors rounded-full" />
    );
}

export function ModalScrollBody({ children, className = "max-h-[80vh]" }: { children: ReactNode; className?: string }) {
    return (
        <ScrollShadow className={className} hideScrollBar>
            {children}
        </ScrollShadow>
    );
}

interface ModalShellProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    label: string;
    children: ReactNode;
    backdropClassName?: string;
    backdropVariant?: "opaque" | "blur" | "transparent";
    isDismissable?: boolean;
    isKeyboardDismissDisabled?: boolean;
    containerClassName?: string;
    containerPlacement?: "top" | "center" | "bottom";
    containerScroll?: "inside" | "outside";
    dialogClassName?: string;
    hideCloseButton?: boolean;
    footer?: ReactNode;
    animated?: boolean;
}

export function ModalShell({
    isOpen,
    onOpenChange,
    label,
    children,
    backdropClassName,
    backdropVariant = "blur",
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    containerClassName,
    containerPlacement,
    containerScroll,
    dialogClassName,
    hideCloseButton = false,
    footer,
    animated = true,
}: ModalShellProps) {
    const backdropClass = `${animated ? `${modalAnimation.backdrop} ` : ""}${backdropClassName ?? modalBackdropGradient}`;
    const containerClass = `${animated ? `${modalAnimation.container} ` : ""}${containerClassName || ""}`;

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className={backdropClass}
            variant={backdropVariant}
            isDismissable={isDismissable}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}
        >
            <Modal.Container
                className={containerClass || undefined}
                placement={containerPlacement}
                scroll={containerScroll}
            >
                <Modal.Dialog aria-label={label} className={dialogClassName}>
                    {!hideCloseButton && <ModalCloseButton />}
                    {children}
                    {footer && (
                        <Modal.Footer className="absolute bottom-0 left-0 right-0 flex justify-center p-6 bg-linear-to-t from-background via-background/90 to-transparent">
                            {footer}
                        </Modal.Footer>
                    )}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
