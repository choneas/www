import fs from 'fs';
import path from 'path';

/**
 * Default locale used as fallback when no match is found
 */
export const DEFAULT_LOCALE = 'en';

let supportedLocalesCache: string[] | undefined;

/**
 * Internal function to scan locales directory (synchronous, no caching)
 */
function scanLocalesSync(): string[] {
    if (process.env.NODE_ENV !== 'development' && supportedLocalesCache) {
        return supportedLocalesCache;
    }

    const localesDir = path.join(process.cwd(), 'locales');
    const files = fs.readdirSync(localesDir);

    // Filter JSON files and extract locale codes
    const locales = files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));

    // Ensure default locale exists
    if (!locales.includes(DEFAULT_LOCALE)) {
        throw new Error(
            `Default locale "${DEFAULT_LOCALE}.json" is missing in locales/ directory`
        );
    }

    const supportedLocales = locales.sort((a, b) => a.localeCompare(b));
    supportedLocalesCache = supportedLocales;
    return supportedLocales;
}

/**
 * Scans the locales/ directory and returns a list of available locale codes.
 * Use this in Server Components and Server Actions.
 * 
 * Note: Caching is handled at a higher level (in request.ts) to avoid
 * "use cache" file restrictions.
 * 
 * @returns Array of locale codes (e.g., ['en', 'zh-CN', 'es'])
 * @throws Error if the default locale 'en.json' is missing
 */
export async function getSupportedLocales(): Promise<string[]> {
    return scanLocalesSync();
}

/**
 * Parses the HTTP Accept-Language header and returns an ordered list of preferred locales.
 * 
 * @param acceptLanguage - The Accept-Language header value (e.g., "en-US,en;q=0.9,zh-CN;q=0.8")
 * @returns Array of locale codes in priority order (e.g., ['en-US', 'en', 'zh-CN'])
 */
export function parseAcceptLanguage(acceptLanguage: string): string[] {
    try {
        return acceptLanguage
            .split(',')
            .map((lang, index) => {
                const [locale = '', ...params] = lang.trim().split(';');
                const quality = params
                    .map(param => param.trim())
                    .find(param => param.startsWith('q='))
                    ?.slice(2);

                return {
                    locale,
                    index,
                    quality: quality ? Number.parseFloat(quality) : 1,
                };
            })
            .filter(({ locale, quality }) => locale && locale !== '*' && quality > 0)
            .sort((a, b) => b.quality - a.quality || a.index - b.index)
            .map(({ locale }) => locale);
    } catch (error) {
        console.warn('Failed to parse Accept-Language header:', error);
        return [];
    }
}

function canonicalizeLocale(locale: string): string {
    try {
        return Intl.getCanonicalLocales(locale)[0] ?? locale;
    } catch {
        return locale;
    }
}

/**
 * Finds the best matching locale from user preferences against supported locales.
 * Matching strategy:
 * 1. Exact match (e.g., "zh-CN" === "zh-CN")
 * 2. Language code match (e.g., "zh" matches "zh-CN")
 * 3. Fallback to DEFAULT_LOCALE
 * 
 * @param preferredLocales - User's preferred locales in priority order
 * @param supportedLocales - Available locales in the application
 * @returns The best matching locale code
 */
export function findBestMatch(
    preferredLocales: string[],
    supportedLocales: string[]
): string {
    const supportedByCanonical = new Map(
        supportedLocales.map(locale => [canonicalizeLocale(locale).toLowerCase(), locale])
    );

    for (const locale of preferredLocales) {
        const canonicalLocale = canonicalizeLocale(locale);
        const canonicalKey = canonicalLocale.toLowerCase();

        // Try exact match first
        const exactMatch = supportedByCanonical.get(canonicalKey);
        if (exactMatch) {
            return exactMatch;
        }

        // Try language code match (e.g., "fr-CA" matches "fr")
        const langCode = canonicalLocale.split('-')[0]?.toLowerCase();
        const match = supportedLocales.find(supported => {
            const supportedKey = canonicalizeLocale(supported).toLowerCase();
            return supportedKey === langCode || supportedKey.startsWith(`${langCode}-`);
        }
        );
        if (match) {
            return match;
        }
    }

    // Fallback to default locale
    return DEFAULT_LOCALE;
}
