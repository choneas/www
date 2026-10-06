import { getTranslations } from "next-intl/server"

export async function SkipToContent() {
    const t = await getTranslations("Accessibility")

    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:shadow-lg"
        >
            {t("skip-to-content")}
        </a>
    )
}
