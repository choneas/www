import { getTranslations } from "next-intl/server";
import { cn } from "@heroui/react";
import { socialLinks } from "@/constants/about";

interface SwallowProps {
    className?: string;
}

export function Swallow({ className }: SwallowProps) {
    return (
        <div
            className={cn(
                "bg-accent/60",
                className
            )}
            style={{
                maskImage: 'url(/images/swallow.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/images/swallow.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
            }}
        />
    );
}

export async function Footer() {
    const t = await getTranslations("Footer");

    const links = socialLinks.filter(l => l.href);

    return (
        <footer className="relative w-full flex flex-col items-center overflow-hidden py-6 md:py-12 z-40" style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--heroui-overlay) 70%)' }}>
            <div className="w-full max-w-5xl mx-auto px-6 md:px-12 relative flex items-center justify-center min-h-[200px]">
                {/* Left Swallow - Lower */}
                <Swallow className="absolute left-6 md:left-[5vh] top-[60%] md:top-[80%] -translate-y-1/2 w-[80px] h-[63px] md:w-[140px] md:h-[123px] opacity-90" />

                {/* Center Icons */}
                <div className="flex gap-6 md:gap-8 z-10 shrink-0 mx-auto items-center justify-center">
                    {links.map((item) => (
                        <a
                            aria-label={item.name}
                            key={item.href}
                            href={item.href!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/40 bg-blend-overlay hover:text-foreground/80 transition-colors text-xl md:text-3xl"
                        >
                            {item.icon}
                        </a>
                    ))}
                </div>

                {/* Right Swallow - Higher */}
                <Swallow className="absolute right-6 md:right-[5vh] top-[40%] md:top-[20%] -translate-y-1/2 w-[80px] h-[63px] md:w-[140px] md:h-[123px] rotate-[180deg] opacity-90" />
            </div>

            <div className="text-center text-foreground/30 text-sm md:text-base font-serif opacity-80 z-10 mb-14 md:mb-0">
                <p>{t("copyright")}</p>
            </div>
        </footer>
    );
}
