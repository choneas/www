import Link from "next/link";
import { buttonVariants } from "@heroui/react";
import type { SocialLink as SocialLinkProps } from "@/lib/social-feeds";

// Shared styles for both Button and Link
const sharedClassName = "inline-flex items-center justify-center gap-2 font-medium";

export function SocialLink(link: SocialLinkProps) {
    const content = (
        <>
            {link.icon}
            <span className="font-bold">{link.platform}</span>
            {link.name && <span className="font-extralight">{link.name}</span>}
        </>
    );

    // Use buttonVariants for consistent styling on both button and link
    const className = buttonVariants({ variant: "secondary", className: sharedClassName });

    if (!link.href) {
        return (
            <button type="button" className={className}>
                {content}
            </button>
        );
    }

    return (
        <Link href={link.href} className={className}>
            {content}
        </Link>
    );
}