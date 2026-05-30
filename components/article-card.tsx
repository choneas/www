"use client";

import NextLink from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { uuidToId } from "notion-utils";
import { Card } from "@heroui/react";
import { Avatar } from "@/components/avatar";
import { Tags } from "@/components/tags";
import { triggerNavigationLoading } from "@/components/navigation-loader";
import type { PostMetadata } from "@/lib/content";
import { formatDate } from "@/utils/date-format";
import { useViewCount } from "@/utils/use-view-count";

export function ArticleCard({
                                article,
                                linkParam = "slug",
                                showTime = false,
                            }: {
    article: PostMetadata;
    linkParam?: "slug" | "id" | "notionid";
    showTime?: boolean;
}) {
    const locale = useLocale();
    const t = useTranslations("Post-Header")
    const views = useViewCount(article.slug || article.id)

    const href =
        `/article/${linkParam === "slug" && article.slug ? article.slug :
            linkParam === "notionid" && article.notionid ? uuidToId(article.notionid) :
                article.id
        }`;

    const showViews = views != null && views > 0

    const AuthorAndDate = ({className = ""}) => (
        <div className={`flex items-center text-sm ${className}`}>
            <div className="flex items-center gap-2">
                {article.author?.[0] && (
                    <>
                        {article.author[0].avatar && (
                            <Avatar
                                size="sm"
                            />
                        )}
                        <span translate="no">{article.author[0].name}</span>
                        <span>·</span>
                    </>
                )}
                {article.last_edited_time && (
                    <time>
                        {formatDate(article.created_time, locale, showTime)}
                        {article.readingTime && ` · ${article.readingTime}`}
                    </time>
                )}
                {showViews && (
                    <>
                        <span className="hidden md:inline">·</span>
                        <span className="hidden md:inline">{views} {t('views')}</span>
                    </>
                )}
            </div>
            {showViews && (
                <span className="md:hidden ml-auto shrink-0">{views} {t('views')}</span>
            )}
        </div>
    );

    // Consistent focus ring styles that match Card's border-radius
    const focusClass =
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[calc(var(--radius-xl)+2px)]";

    // Trigger loading overlay on navigation
    const handleNavigate = () => {
        triggerNavigationLoading(href, {
            hasCover: !!article.cover,
            hasIcon: !!article.icon,
        });
    };

    if (article.cover) {
        return (
            <NextLink
                href={href}
                className={`${focusClass} block`}
                aria-label={`${article.title}, ${formatDate(article.created_time, locale, showTime)}${article.readingTime ? `, ${article.readingTime}` : ""}${article.tags && article.tags.length > 0 ? `, : ${article.tags.join(", ")}` : ""}`}
                onNavigate={handleNavigate}
            >
                <Card className="bg-content2 hover:bg-surface-hover transition-all duration-100 border-none shadow-none">
                    <div className="lg:hidden">
                        <div
                            className="relative w-full aspect-video overflow-hidden rounded-b-md rounded-t-[calc(var(--radius-md)*2)]">
                            <Image
                                alt={article.title}
                                src={article.cover}
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                    </div>

                    {/* Desktop: grid, photos on right */}
                    <div className="hidden lg:grid lg:grid-cols-[1fr_380px] gap-4 p-4 h-[232px]">
                        <div className="flex flex-col gap-3 overflow-hidden">
                            <AuthorAndDate/>
                            <span className="text-2xl font-semibold line-clamp-1 shrink-0">{article.title}</span>
                            {article.tags && article.tags.length > 0 &&
                                <div className="shrink-0"><Tags tags={article.tags}/></div>}
                            {article.description && (
                                <span className="text-sm text-foreground/60 line-clamp-3 max-w-2xl">
                                    {article.description}
                                </span>
                            )}
                        </div>

                        <div className="relative w-full h-[200px] overflow-hidden rounded-[calc(var(--radius-md)*2)]">
                            <Image alt={article.title} src={article.cover} fill className="object-cover"/>
                        </div>
                    </div>

                    {/* Mobile: content on down */}
                    <Card.Content className="lg:hidden p-4">
                        <div className="flex flex-col gap-3">
                            <AuthorAndDate/>
                            <span className="text-2xl font-semibold">{article.title}</span>
                            {article.tags && article.tags.length > 0 && <Tags tags={article.tags}/>}
                            {article.description && (
                                <span className="text-sm text-foreground/60 line-clamp-3">{article.description}</span>
                            )}
                        </div>
                    </Card.Content>
                </Card>
            </NextLink>
        );
    }

    return (
        <NextLink
            href={href}
            className={`${focusClass} block`}
            aria-label={`${article.title}，${formatDate(article.created_time, locale, showTime)}${article.readingTime ? `，ETA ${article.readingTime}` : ""}${article.tags && article.tags.length > 0 ? `，${article.tags.join(", ")}` : ""}`}
            onNavigate={handleNavigate}
        >
            <article>
                <Card className="bg-bg-content2 hover:bg-surface-hover transition-all duration-100 border-none shadow-none">
                    <Card.Content className="p-3">
                        <div className="flex flex-col gap-3">
                            <AuthorAndDate/>
                            <span className="text-2xl font-semibold line-clamp-2">{article.title}</span>
                            {article.tags && article.tags.length > 0 && <Tags tags={article.tags}/>}
                            {article.description && (
                                <span className="text-sm text-foreground/60 line-clamp-3">
                                    {article.description}
                                </span>
                            )}
                        </div>
                    </Card.Content>
                </Card>
            </article>
        </NextLink>
    );
}
