import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics } from "@next/third-parties/google";
import { Noto_Serif_SC, Google_Sans_Code } from "next/font/google";
import { NavbarWrapper } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { SkipToContent } from "@/components/skip-to-content";
import { CopyrightToast } from "@/components/copyright-toast";
import { themeInitScript } from "@/utils/theme";
import { DEFAULT_LOCALE } from "@/lib/locales.server";
import "overlayscrollbars/overlayscrollbars.css";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL('https://choneas.com'),
};

const notoSerif = Noto_Serif_SC({
    variable: "--font-serif",
    subsets: ["latin"],
    display: "swap",
    weight: "variable",
    fallback: ["Noto Serif SC", "Noto Serif", "serif", "Times New Roman", "system-ui"],
});

const googleSansCode = Google_Sans_Code({
    variable: "--font-code",
    display: "swap",
    subsets: ["latin"],
    fallback: ["Source Code Pro", "monospace"],
});

async function IntlShell({ children }: { children: React.ReactNode }) {
    const [locale, messages] = await Promise.all([
        getLocale(),
        getMessages(),
    ]);

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers>
                <SkipToContent />
                <NavbarWrapper />
                <div className="min-h-[calc(100svh+1px)]">
                    {children}
                </div>
                <Footer />
                <CopyrightToast />
            </Providers>
        </NextIntlClientProvider>
    );
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang={DEFAULT_LOCALE} suppressHydrationWarning data-overlayscrollbars-initialize>
            <body
                data-overlayscrollbars-initialize
                className={`${notoSerif.variable} ${googleSansCode.variable} font-serif text-foreground bg-background antialiased scroll-smooth`}
            >
                <Script
                    id="theme-init"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{ __html: themeInitScript }}
                />
                <Suspense fallback={null}>
                    <IntlShell>{children}</IntlShell>
                </Suspense>
                <Analytics />
                <SpeedInsights />
            </body>
            {process.env.GA_ID && <GoogleAnalytics gaId={process.env.GA_ID} />}
        </html>
    );
}
