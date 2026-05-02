import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import {
    getSupportedLocales,
    DEFAULT_LOCALE,
    findBestMatch,
    parseAcceptLanguage
} from '@/lib/locales.server';

export default getRequestConfig(async ({ requestLocale }) => {
    const supportedLocales = await getSupportedLocales();
    const cookieStore = await cookies();
    const headersList = await headers();
    const requestedLocale = await requestLocale;
    const preferredLocale = cookieStore.get('NEXT_PREF_LOCALE')?.value;
    const acceptLanguage = headersList.get('Accept-Language') || '';

    const locale = findBestMatch(
        [
            requestedLocale,
            preferredLocale,
            ...parseAcceptLanguage(acceptLanguage),
        ].filter((locale): locale is string => Boolean(locale)),
        supportedLocales
    );

    return {
        locale: supportedLocales.includes(locale) ? locale : DEFAULT_LOCALE,
        messages: (await import(`./${locale}.json`)).default
    };
});
