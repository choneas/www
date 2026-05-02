"use client"

import { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PostMetadata } from "@/lib/content"
import { ArticleCard } from "@/components/article-card"
import { ArticleFilter } from "@/components/article-filter"

interface ArticleListProps {
    articles: PostMetadata[]
    sortOrder?: 'asc' | 'desc'
    linkParam?: 'slug' | 'id' | 'notionid'
    showTime?: boolean
}

// Spring animation configuration
const springConfig = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8
}

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: springConfig },
    // Exit in place with absolute positioning to avoid layout shift
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
}

export function ArticleList({
    articles,
    sortOrder = 'desc',
    linkParam = 'slug',
    showTime = false
}: ArticleListProps) {
    // Track both filtered articles and hasNoResults state together
    const [filterState, setFilterState] = useState<{
        articles: PostMetadata[]
        hasNoResults: boolean
    }>({ articles, hasNoResults: false })

    const handleFilterChange = useCallback((filtered: PostMetadata[], hasNoResults: boolean) => {
        setFilterState({ articles: filtered, hasNoResults })
    }, [])

    const { articles: filteredArticles, hasNoResults } = filterState

    // Only show articles when there are results (not in no-results state)
    const shouldShowArticles = !hasNoResults && filteredArticles.length > 0

    return (
        <>
            <ArticleFilter
                articles={articles}
                sortOrder={sortOrder}
                onFilterChange={handleFilterChange}
            />
            {shouldShowArticles && (
                <div className="relative grid grid-cols-1 gap-6 mt-4">
                    <AnimatePresence mode="popLayout">
                        {filteredArticles.map((article: PostMetadata) => (
                            <motion.div
                                key={article.id}
                                layout
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={springConfig}
                            >
                                <ArticleCard
                                    linkParam={linkParam}
                                    article={article}
                                    showTime={showTime}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </>
    )
}
