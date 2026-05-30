"use client"

import { useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Tags } from "@/components/tags"
import { useTranslations, useLocale } from "next-intl"
import { formatDate } from "@/utils/date-format"
import type { PostMetadata } from "@/lib/content"
import { usePostMetadata } from "@/stores/post"
import { Avatar } from "@/components/avatar"

interface PostHeaderProps {
    post: PostMetadata;
    isTweet?: boolean;
    views?: number;
}

const TITLE_SPRING = {
    type: "spring" as const,
    stiffness: 300,
    damping: 18,
    mass: 0.3,
}

const fadeUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
}

export function PostHeader({ post, isTweet, views }: PostHeaderProps) {
    const t = useTranslations("Post-Header")
    const locale = useLocale()
    const { setPostMetadata } = usePostMetadata()
    const isSocialPost = post.platform === 'x' || post.platform === 'bluesky'

    useEffect(() => {
        setPostMetadata?.(post)
    }, [post, setPostMetadata])

    if (isSocialPost) {
        return (
            <div className="flex gap-3 items-center py-4">
                <Avatar size="md" name="Choneas" />
                <div className="flex flex-col">
                    <span className="text-base font-medium">Choneas</span>
                    <span className="text-sm text-content3-foreground">
                        {formatDate(post.created_time, locale, true)}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <>
            {post.cover ? (
                <div className="relative -mt-[72px] max-w-screen overflow-hidden mb-3">
                    <motion.div
                        className="relative md:h-[50vh] h-[80vh]"
                        initial={{ scale: 1.015 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                        <Image
                            fill
                            src={post.cover}
                            alt={post.title}
                            quality={80}
                            className="h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent">
                            <div className={`h-full flex flex-col justify-end pb-8 ${!isTweet ? 'max-w-6xl mx-auto px-8 sm:px-24 md:px-48' : 'px-8'}`}>
                                <motion.div {...fadeUp} transition={{ ...TITLE_SPRING, delay: 0.01 }}>
                                    <Tags
                                        tags={post.tags || []}
                                        variant="soft"
                                        size="lg"
                                    />
                                </motion.div>
                                <motion.span
                                    className="text-5xl font-bold my-2"
                                    {...fadeUp}
                                    transition={{ ...TITLE_SPRING, delay: 0.03 }}
                                >
                                    {post.icon}
                                </motion.span>
                                <motion.h1
                                    role="heading"
                                    className="text-3xl text-muted mix-blend-plus-lighter font-bold"
                                    {...fadeUp}
                                    transition={{ ...TITLE_SPRING, delay: 0.05 }}
                                >
                                    {post.title.length !== 0 ?
                                        post.title
                                        :
                                        t('tweet-details')
                                    }
                                </motion.h1>
                                <motion.p
                                    className="light backdrop-opacity-50 mix-blend-plus-lighter text-sm mt-4 text-muted!"
                                    {...fadeUp}
                                    transition={{ ...TITLE_SPRING, delay: 0.07 }}
                                >
                                    {t('created') + (post.created_time ? formatDate(post.created_time, locale) : '') + (!isTweet ? ' · ' + t('updated') + (post.last_edited_time ? formatDate(post.last_edited_time, locale) : '') : '') + (views != null && views > 0 ? ' · ' + views + ' ' + t('views') : '')}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className={isTweet ? 'pt-6 pb-4' : 'max-w-6xl mx-auto px-8 sm:mt-20 sm:px-24 md:px-48 pt-8 pb-4'}>
                    <motion.div {...fadeUp} transition={{ ...TITLE_SPRING, delay: 0.01 }}>
                        <Tags
                            tags={post.tags || []}
                            variant="soft"
                            size="lg"
                        />
                    </motion.div>
                    <motion.h1
                        className="text-5xl font-bold my-2"
                        {...fadeUp}
                        transition={{ ...TITLE_SPRING, delay: 0.03 }}
                    >
                        {post.icon}
                    </motion.h1>
                    <motion.h1
                        className={`${isTweet ? 'text-3xl!' : 'text-4xl!'} font-bold my-4`}
                        {...fadeUp}
                        transition={{ ...TITLE_SPRING, delay: 0.05 }}
                    >
                        {post.title.length !== 0 ?
                            post.title
                            :
                            t('tweet-details')
                        }
                    </motion.h1>
                    <motion.p
                        className="text-content2-foreground"
                        {...fadeUp}
                        transition={{ ...TITLE_SPRING, delay: 0.07 }}
                    >
                        {t('created') + (post.created_time ? formatDate(post.created_time, locale) : '') + (!isTweet ? ' · ' + t('updated') + (post.last_edited_time ? formatDate(post.last_edited_time, locale) : '') : '') + (views != null && views > 0 ? ' · ' + views + ' ' + t('views') : '')}
                    </motion.p>
                </div>
            )}
        </>
    )
}