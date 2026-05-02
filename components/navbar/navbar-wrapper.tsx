import { getTranslations, getLocale } from "next-intl/server";
import { cacheLife } from "next/cache";
import { navItems } from "@/constants/navbar";
import { Navbar } from "@/components/navbar";
import { getSupportedLocales } from "@/lib/locales.server";

async function getNavbarTranslations(locale: string) {
    "use cache: private"
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
