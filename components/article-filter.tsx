"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchField, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import type { PostMetadata } from "@/lib/content";

interface ArticleFilterProps {
    articles: PostMetadata[];
    sortOrder?: "asc" | "desc";
    onFilterChange: (filtered: PostMetadata[], hasNoResults: boolean) => void;
}

/** Extract unique tags from articles */
function parseTags(articles: PostMetadata[]): string[] {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
        article.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
}

/** Filter and sort articles based on tags and search value */
function filterArticles(
    articles: PostMetadata[],
    selectedTags: string[],
    searchValue: string,
    sortOrder: "asc" | "desc"
): PostMetadata[] {
    return articles
        .filter((article) => {
            // Tag filter
            if (selectedTags.length > 0) {
                if (!article.tags || !selectedTags.some((t) => article.tags?.includes(t))) {
                    return false;
                }
            }
            // Search filter
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

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isListFocused, setIsListFocused] = useState(false);
    const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

    const tags = useMemo(() => parseTags(articles), [articles]);

    const orderedTags = useMemo(() => {
        const selectedSet = new Set(selectedTags);
        const selectedFirst = selectedTags.filter((tag) => tags.includes(tag));
        const remaining = tags.filter((tag) => !selectedSet.has(tag));
        return [...selectedFirst, ...remaining];
    }, [selectedTags, tags]);

    // Compute filtered articles and hasNoResults together
    const { filteredArticles, hasNoResults } = useMemo(() => {
        const filtered = filterArticles(articles, selectedTags, searchValue, sortOrder);
        const isFiltering = selectedTags.length > 0 || searchValue.length > 0;
        return {
            filteredArticles: filtered,
            hasNoResults: filtered.length === 0 && isFiltering,
        };
    }, [articles, selectedTags, searchValue, sortOrder]);

    // Sync filter results to parent - pass both filtered articles and hasNoResults
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
    }, [orderedTags, updateScrollAvailability]);

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const scrollBy = (direction: number) => {
        scrollRef.current?.scrollBy({
            left: direction * 180,
            behavior: "smooth",
        });
    };

    const scrollActiveIntoView = (index: number) => {
        const el = scrollRef.current?.querySelector<HTMLElement>(`[data-tag-index="${index}"]`);
        el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };

    const onTagsFocus = () => {
        setIsListFocused(true);
        if (activeIndex == null && orderedTags.length > 0) {
            setActiveIndex(0);
        }
    };
    const onTagsBlur = () => {
        setIsListFocused(false);
        setActiveIndex(null);
    };

    // Roving focus
    const onTagsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isListFocused || orderedTags.length === 0) return;

        switch (e.key) {
            case "ArrowRight":
            case "Right":
                e.preventDefault();
                setActiveIndex((i) => {
                    const curr = i ?? 0;
                    const next = Math.min(curr + 1, orderedTags.length - 1);
                    scrollActiveIntoView(next);
                    return next;
                });
                break;
            case "ArrowLeft":
            case "Left":
                e.preventDefault();
                setActiveIndex((i) => {
                    const curr = i ?? 0;
                    const prev = Math.max(curr - 1, 0);
                    scrollActiveIntoView(prev);
                    return prev;
                });
                break;
            case "Home":
                e.preventDefault();
                scrollActiveIntoView(0);
                setActiveIndex(0);
                break;
            case "End":
                e.preventDefault();
                scrollActiveIntoView(orderedTags.length - 1);
                setActiveIndex(orderedTags.length - 1);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (activeIndex != null) {
                    handleTagToggle(orderedTags[activeIndex]);
                }
                break;
            default:
                break;
        }
    };

    // aria activedescendant
    const activeId =
        isListFocused && activeIndex != null && orderedTags[activeIndex]
            ? `tag-${orderedTags[activeIndex]}`
            : undefined;

    return (
        <div className="flex flex-col gap-2">
            <SearchField
                fullWidth
                isInvalid={hasNoResults}
                value={searchValue}
                onChange={setSearchValue}
            >
                <SearchField.Group className="rounded-full pl-1 py-3 md:pl-3 md:py-6">
                    <SearchField.SearchIcon fontSize={32}>
                        <IoSearch/>
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

                    <button
                        onClick={() => scrollBy(-1)}
                        aria-label="←"
                        tabIndex={-1}
                        aria-hidden={!canScrollLeft}
                        className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full
                                bg-surface-secondary transition-opacity duration-200 ease-in-out transform
                                ${canScrollLeft ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
                    >
                        <LuChevronLeft size={18} />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex gap-3 w-full overflow-x-auto focus:outline-none"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                        tabIndex={0}
                        role="listbox"
                        aria-label={t("filter-tags")}
                        aria-activedescendant={activeId}
                        onKeyDown={(e) => {
                            if (["ArrowRight", "ArrowLeft", "Right", "Left", "Home", "End", "Enter", " "].includes(e.key)) {
                                setIsKeyboardNavigation(true);
                            }
                            onTagsKeyDown(e);
                        }}
                        onFocus={() => {
                            onTagsFocus();
                        }}
                        onBlur={onTagsBlur}
                        onPointerDown={() => setIsKeyboardNavigation(false)}
                    >
                        {orderedTags.map((tag, idx) => {
                            const isSelected = selectedTags.includes(tag);
                            // const isActive = isListFocused && activeIndex === idx;

                            return (
                                <motion.div
                                    key={tag}
                                    layout
                                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                                >
                                    <Chip
                                        tabIndex={-1}
                                        role="option"
                                        aria-selected={isSelected}
                                        id={`tag-${tag}`}
                                        data-tag-index={idx}
                                        className={`px-3 py-2 rounded-full text-base font-medium justify-center cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis
                                                    ${isListFocused && isKeyboardNavigation && activeIndex === idx ? "ring-inset ring-2 ring-accent" : ""}`}
                                        style={{
                                            backgroundColor: isSelected
                                                ? "var(--color-accent)"
                                                : "color-mix(in srgb, var(--color-surface) 90%, transparent)",
                                            color: isSelected
                                                ? "var(--color-accent-foreground)"
                                                : "var(--color-foreground)",
                                            flexShrink: 0,
                                        }}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setActiveIndex(idx);
                                            handleTagToggle(tag);
                                        }}
                                        onMouseEnter={() => {
                                            if (isListFocused) setActiveIndex(idx);
                                        }}
                                    >
                                        {tag}
                                    </Chip>
                                </motion.div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => scrollBy(1)}
                        aria-label="→"
                        tabIndex={-1}
                        aria-hidden={!canScrollRight}
                        className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full
                            bg-surface-secondary transition-opacity duration-200 ease-in-out transform
                            ${canScrollRight ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
                    >
                        <LuChevronRight size={18} />
                    </button>
                </div>
            </div>

            {hasNoResults && (
                <div className="flex flex-col justify-center items-center h-32 mt-4">
                    <IoSearch size={48} className="text-muted" />
                    <p className="pt-4 text-muted">{t("not-found")}</p>
                </div>
            )}
        </div>
    );
}
