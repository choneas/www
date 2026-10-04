import { getTranslations, getLocale } from "next-intl/server";
import { cacheLife } from "next/cache";
import { navItems } from "@/components/nav-items";
import { Navbar } from "@/components/navbar";
import { getSupportedLocales } from "@/lib/locale";

async function getNavbarTranslations(locale: string) {
    "use cache: private"
    // Navbar labels change rarely; cache per-locale for a day, serve stale for an hour.
    cacheLife({ stale: 3600, revalidate: 86400 });

    const t = await getTranslations({ locale, namespace: "Navbar" });

    const translations: Record<string, string> = {};
    for (const item of navItems) {
        translations[item.name] = t(item.name);
    }

    return translations;
}

export async function NavbarWrapper() {
    const [locale, supportedLocales] = await Promise.all([
        getLocale(),
        getSupportedLocales(),
    ]);
    const translations = await getNavbarTranslations(locale);

    return <Navbar translations={translations} supportedLocales={supportedLocales} />;
}
