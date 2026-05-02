import Image from "next/image";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen">
            <div className="absolute top-0 left-0 right-0 -z-10 h-[60vh] md:h-[65vh] md:rounded-bl-[60px] md:rounded-br-[60px] overflow-hidden">
                <Image
                    src="/images/about-bg.webp"
                    alt=""
                    fill
                    className="object-cover dark:brightness-[0.7] saturate-[1.2]"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/5 to-transparent" />
            </div>
            {children}
        </div>
    );
}
