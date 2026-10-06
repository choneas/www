"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchField } from "@heroui/react";
import { TagGroup, TagList, Tag, type Selection } from "react-aria-components";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import type { PostMetadata } from "@/lib/content";

interface ArticleFilterProps {
    articles: PostMetadata[];
    sortOrder?: "asc" | "desc";
    onFilterChange: (filtered: PostMetadata[], hasNoResults: boolean) => void;
}

function parseTags(articles: PostMetadata[]): string[] {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
        article.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
}

function filterArticles(
    articles: PostMetadata[],
    selectedTags: string[],
    searchValue: string,
    sortOrder: "asc" | "desc"
): PostMetadata[] {
    return articles
        .filter((article) => {
            if (selectedTags.length > 0) {
                if (!article.tags || !selectedTags.some((t) => article.tags?.includes(t))) {
                    return false;
                }
            }
            if (searchValue) {
                const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => term.length > 0);
                const titleLower = article.title.toLowerCase();
                const descriptionLower = article.description?.toLowerCase() || "";
                const tocContent = article.toc?.map((item) => item.text.toLowerCase()).join(" ") || "";

                return searchTerms.every(
                    (term) => titleLower.includes(term) || descriptionLower.includes(term) || tocContent.includes(term)
                );
            }
            return true;
        })
        .sort((a, b) => {
            const timeA = a.created_time ? new Date(a.created_time).getTime() : 0;
            const timeB = b.created_time ? new Date(b.created_time).getTime() : 0;
            return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
        });
}

export function ArticleFilter({
    articles,
    sortOrder = "desc",
    onFilterChange,
}: ArticleFilterProps) {
    const t = useTranslations("Article-Filter");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState("");

    const tags = useMemo(() => parseTags(articles), [articles]);

    const { filteredArticles, hasNoResults } = useMemo(() => {
        const filtered = filterArticles(articles, selectedTags, searchValue, sortOrder);
        const isFiltering = selectedTags.length > 0 || searchValue.length > 0;
        return {
            filteredArticles: filtered,
            hasNoResults: filtered.length === 0 && isFiltering,
        };
    }, [articles, selectedTags, searchValue, sortOrder]);

    useEffect(() => {
        onFilterChange(filteredArticles, hasNoResults);
    }, [filteredArticles, hasNoResults, onFilterChange]);

    const updateScrollAvailability = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }, []);

    useEffect(() => {
        updateScrollAvailability();
        const container = scrollRef.current;
        const handleResize = () => updateScrollAvailability();

        if (container) {
            container.addEventListener("scroll", updateScrollAvailability, { passive: true });
        }
        window.addEventListener("resize", handleResize);

        return () => {
            container?.removeEventListener("scroll", updateScrollAvailability);
            window.removeEventListener("resize", handleResize);
        };
    }, [tags, updateScrollAvailability]);

    const handleSelectionChange = (keys: Selection) => {
        if (keys === "all") return;
        setSelectedTags(Array.from(keys).map(String));
    };

    const scrollBy = (direction: number) => {
        scrollRef.current?.scrollBy({
            left: direction * 180,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex flex-col gap-2 overflow-visible">
            <SearchField
                fullWidth
                isInvalid={hasNoResults}
                value={searchValue}
                onChange={setSearchValue}
            >
                <SearchField.Group className="rounded-full pl-1 py-3 md:pl-3 md:py-6">
                    <SearchField.SearchIcon fontSize={32}>
                        <IoSearch />
                    </SearchField.SearchIcon>
                    <SearchField.Input
                        className="w-full md:text-[18px] backdrop-opacity-0"
                        placeholder={t("placeholder-search")}
                    />
                    <SearchField.ClearButton className="mr-3" />
                </SearchField.Group>
            </SearchField>

            <div>
                <div className="relative mt-2">
                    {canScrollLeft && (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute left-0 top-0 h-full w-12
                         bg-[linear-gradient(to_right,var(--color-background),transparent)]"
                        />
                    )}

                    {canScrollRight && (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute right-0 top-0 h-full w-12
                         bg-[linear-gradient(to_left,var(--color-background),transparent)]"
                        />
                    )}

                    {canScrollLeft && (
                        <button
                            type="button"
                            onClick={() => scrollBy(-1)}
                            aria-label={t("scroll-left")}
                            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary cursor-pointer"
                        >
                            <LuChevronLeft size={18} aria-hidden="true" />
                        </button>
                    )}

                    <TagGroup
                        aria-label={t("filter-tags")}
                        selectionMode="multiple"
                        selectedKeys={new Set(selectedTags)}
                        onSelectionChange={handleSelectionChange}
                    >
                        <TagList
                            ref={scrollRef}
                            items={tags.map((tag) => ({ id: tag, label: tag }))}
                            className="flex gap-3 w-full overflow-x-auto py-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {(item) => (
                                <Tag
                                    id={item.id}
                                    textValue={item.label}
                                    className={({ isSelected }) =>
                                        `px-3 py-2 rounded-full text-base font-medium justify-center cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis shrink-0 transition-colors ${isSelected
                                            ? "bg-(--color-accent) text-(--color-accent-foreground)"
                                            : "bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] text-(--color-foreground)"}`
                                    }
                                >
                                    {item.label}
                                </Tag>
                            )}
                        </TagList>
                    </TagGroup>

                    {canScrollRight && (
                        <button
                            type="button"
                            onClick={() => scrollBy(1)}
                            aria-label={t("scroll-right")}
                            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary cursor-pointer"
                        >
                            <LuChevronRight size={18} aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            {hasNoResults && (
                <div role="status" className="flex flex-col justify-center items-center h-32 mt-4">
                    <IoSearch size={48} className="text-muted" aria-hidden="true" />
                    <p className="pt-4 text-muted">{t("not-found")}</p>
                </div>
            )}
        </div>
    );
}
