'use client'

import { Card, Skeleton, Button } from "@heroui/react"
import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { LuMessageCircle } from "react-icons/lu"
import { FaXTwitter } from "react-icons/fa6"
import { SiBluesky } from "react-icons/si"
import { PiHandsClappingLight, PiHandsClappingFill } from "react-icons/pi"
import NumberFlow from "@number-flow/react"
import { useClapSession } from "@/utils/use-clap-session"
import { getCookie } from "@/utils/actions-cookie"
import Image from "next/image"
import dynamic from "next/dynamic"
import { GlassPanel } from "@/components/home/glass-panel";
import { Tags } from "@/components/tags"
import { TweetModal } from "@/components/tweet-modal"
import type { ExtendedRecordMap } from "notion-types"
import type { PostMetadata } from "@/lib/content"
import { formatDate } from "@/utils/date-format"
import { getPostRecordMap } from "@/lib/content"
import { trackView } from "@/utils/track-view"
import { useViewCount } from "@/utils/use-view-count"

const NotionPage = dynamic(() => import("@/components/notion-page"), {
  loading: () => <NotionPageSkeleton/>,
  ssr: false
})

interface MomentCardProps {
  moment: PostMetadata;
}

const platformIcons: Record<string, typeof FaXTwitter> = {
  x: FaXTwitter,
  bluesky: SiBluesky,
}

export function MomentCard({moment}: MomentCardProps) {
  const isTweet = moment.type === "Tweet"
  const isNotionPost = moment.platform === 'notion' || !moment.platform
  const t = useTranslations('Moment')
  const router = useRouter()
  const locale = useLocale()
  const views = useViewCount(moment.slug || moment.id)
  const [isLoading, setIsLoading] = useState(isTweet && isNotionPost)
  const [isExpanded, setIsExpanded] = useState(false)
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [needsExpansion, setNeedsExpansion] = useState(false)

  const observerRef = useRef<ResizeObserver | null>(null)
  const slug = moment.slug || moment.id || ''

  const { displayClaps, isClapped, handleClap } = useClapSession(slug)
  const [canPrompt, setCanPrompt] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'thanking'>('idle')
  const [isHovering, setIsHovering] = useState(false)
  const thankTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [floatingClaps, setFloatingClaps] = useState<{ id: number }[]>([])

  const handleClapEnter = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    setIsHovering(true)
  }
  const handleClapLeave = () => {
    leaveTimerRef.current = setTimeout(() => setIsHovering(false), 80)
  }

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (node) {
      observerRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement
          const isTooTall = element.scrollHeight > 200
          setNeedsExpansion(prev => prev === isTooTall ? prev : isTooTall)
        }
      })
      observerRef.current.observe(node)
    }
  }, [])

  useEffect(() => {
    if (!isTweet || !isNotionPost || !moment.id) return
    const fetchPost = async () => {
      try {
        const {recordMap: data} = await getPostRecordMap(moment.id as string, true)
        setRecordMap(data)
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPost()
  }, [moment.id, isTweet, isNotionPost])

  useEffect(() => {
    const actions = getCookie()
    const hasEverClapped = Object.values(actions.clapped).some(v => v > 0)
    setCanPrompt(!hasEverClapped)
  }, [])

  useEffect(() => {
    return () => {
      if (thankTimerRef.current) clearTimeout(thankTimerRef.current)
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    }
  }, [])

  if (!moment.id) return null;

  const getOpenLabel = () => {
    if (moment.platform === 'x') return t('view-on-x');
    if (moment.platform === 'bluesky') return t('view-on-bluesky');
    return t('open-in-new-tab');
  };

  const getExternalUrl = () => {
    if (moment.platform === 'x' && moment.social?.postId && moment.social?.username) {
      return `https://x.com/${moment.social.username}/status/${moment.social.postId}`;
    }
    if (moment.platform === 'bluesky' && moment.social?.postId && moment.social?.username) {
      return `https://bsky.app/profile/${moment.social.username}/post/${moment.social.postId}`;
    }
    return null;
  };

  const handleCardClick = () => {
    const externalUrl = getExternalUrl();
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else if (isTweet) {
      setIsModalOpen(true)
    } else {
      router.push('/article/' + (moment.slug || moment.id))
    }
  }

  const handleOpenInNewTab = () => {
    const externalUrl = getExternalUrl();
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      const url = isTweet ? `/tweet/${moment.slug || moment.id}` : `/article/${moment.slug || moment.id}`
      router.push(url)
    }
  }

  const handleViewAllClick = () => {
    trackView(slug)
    if (isTweet) {
      setIsModalOpen(true)
    } else {
      setIsExpanded(true)
    }
  }

  const handleClapClick = () => {
    handleClap()
    const id = Date.now()
    setFloatingClaps(prev => [...prev, { id }])
    setTimeout(() => {
      setFloatingClaps(prev => prev.filter(f => f.id !== id))
    }, 1000)
    if (canPrompt) {
      setCanPrompt(false)
      setPhase('thanking')
      thankTimerRef.current = setTimeout(() => {
        setPhase('idle')
      }, 1900)
    }
  }

  const hasPhotos = moment.photos && moment.photos.length > 0
  const showImagePreview = hasPhotos && (isNotionPost ? moment.imagePreview === true : true)

  return (
      <>
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
        >
          <Card
              onClick={() => {
                if (isNotionPost) handleCardClick()
              }}
              tabIndex={0}
              role="article"
              className="relative min-h-auto bg-transparent p-0 shadow-none rounded-none"
              aria-label={`${moment.title} - ${formatDate(moment.created_time, locale, true)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCardClick()
                }
              }}
          >
            <GlassPanel
                className="backdrop-saturate-100 bg-background/40 hover:bg-background/90 focus:outline-none focus:ring-2 ring-accent transition-all duration-150 ease-out px-6 py-4 md:py-6 mx-0.5">
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {moment.type !== 'Article' && moment.platform && platformIcons[moment.platform] && (
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label={getOpenLabel()}
                        onPress={handleOpenInNewTab}
                        className="text-accent"
                    >
                      {(() => {
                        const Icon = platformIcons[moment.platform!]
                        return <Icon size={20}/>
                      })()}
                    </Button>
                )}
              </div>

              {(isNotionPost || moment.title) && (
                  <span className="text-xl font-semibold">
              {moment.icon && <span className="mr-1" aria-hidden="true">{moment.icon}</span>}
                    {moment.title}
            </span>
              )}

              <div
                  className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-content3-foreground mb-1">
                {moment.platform && moment.platform !== 'notion' && moment.social?.username && (
                    <>
                      <span>@{moment.social.username}</span>
                      <span className="mx-0.5">·</span>
                    </>
                )}
                <span>{formatDate(moment.created_time, locale, true)}</span>
                {moment.platform && moment.platform !== 'notion' && (
                    <span> {moment.created_time.toLocaleTimeString(locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}</span>
                )}
                {!isTweet && moment.readingTime && (
                    <>
                      <span className="mx-0.5">·</span>
                      <span>{moment.readingTime}</span>
                    </>
                )}
                {views != null && views > 0 && (
                    <>
                      <span className="mx-0.5">·</span>
                      <span>{views} {t('views')}</span>
                    </>
                )}
                {moment.tags && moment.tags.length > 0 && (
                    <Tags tags={moment.tags} size="sm"/>
                )}
              </div>

              <motion.div
                  className="space-y-3 -ml-0.5"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{duration: 0.3}}
              >
                <AnimatePresence mode="wait">
                  {isTweet ? (
                      !isNotionPost ? (
                          <motion.div
                              key="social"
                              initial={{opacity: 0}}
                              animate={{opacity: 1}}
                              exit={{opacity: 0}}
                              transition={{duration: 0.2}}
                          >
                            <div className="relative min-h-16">
                              <div className="tweet-preview relative pointer-events-none">
                                <p className="text-foreground/90 text-base! whitespace-pre-wrap">{moment.description}</p>
                              </div>
                            </div>
                            {showImagePreview && <ImagePreview images={moment.photos!}/>}
                          </motion.div>
                      ) : isLoading ? (
                          <motion.div
                              key="loading"
                              initial={{opacity: 0}}
                              animate={{opacity: 1}}
                              exit={{opacity: 0}}
                              transition={{duration: 0.2}}
                          >
                            <TweetContentSkeleton
                                hasDescription={!!moment.description}
                                images={showImagePreview && hasPhotos ? Array(moment.photos!.length).fill(0) : undefined}
                            />
                          </motion.div>
                      ) : recordMap ? (
                          <motion.div
                              key="loaded"
                              initial={{opacity: 0}}
                              animate={{opacity: 1}}
                              exit={{opacity: 0}}
                              transition={{duration: 0.2}}
                          >
                            <div className="relative">
                              {moment.description ? (
                                  <div className="flex items-start gap-2 text-foreground/80">
                                    <LuMessageCircle size={20} className="shrink-0 mt-0.5"
                                                     aria-hidden="true"/>
                                    <p>{moment.description}</p>
                                  </div>
                              ) : (
                                  <div className="relative min-h-16">
                                    <div
                                        ref={measureRef}
                                        className={`tweet-preview relative ${needsExpansion && !isExpanded
                                            ? 'max-h-50 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] mask-[linear-gradient(to_bottom,black_60%,transparent_100%)]'
                                            : ''
                                        } pointer-events-none`}
                                        inert={!isExpanded}
                                        aria-hidden={!isExpanded}
                                        tabIndex={-1}
                                        role="presentation"
                                    >
                                      <Suspense fallback={<NotionPageSkeleton/>}>
                                        <NotionPage recordMap={recordMap} type="tweet-preview"/>
                                      </Suspense>
                                    </div>

                                    {needsExpansion && !isExpanded && (
                                        <div className="-mt-7 pb-1">
                                          <button
                                              type="button"
                                              onClick={handleViewAllClick}
                                              className="text-sm text-accent/70 hover:text-accent underline underline-offset-4 transition-colors cursor-pointer"
                                          >
                                            {t('view-more')}
                                          </button>
                                        </div>
                                    )}

                                    <div className="flex -mx-1.5 mt-2 items-center gap-1">
                                        <div className="relative">
                                          <motion.div layout whileTap={{scale: 0.85}} className={isClapped ? "rounded-full bg-foreground/5" : ""}>
                                            <Button
                                                isIconOnly
                                                variant="ghost"
                                                size="sm"
                                                onPress={handleClapClick}
                                                onMouseEnter={handleClapEnter}
                                                onMouseLeave={handleClapLeave}
                                                aria-label={t('clap-prompt')}
                                            >
                                              {isClapped
                                                  ? <PiHandsClappingFill size={18} className={isClapped || isHovering ? "text-accent transition-colors duration-200" : "text-foreground/60"} />
                                                  : <PiHandsClappingLight size={18} className={isClapped || isHovering ? "text-accent transition-colors duration-200" : "text-foreground/60"} />
                                              }
                                            </Button>
                                          </motion.div>
                                          <AnimatePresence>
                                            {floatingClaps.map(({id}) => (
                                                <motion.div
                                                    key={id}
                                                    initial={{y: 0, opacity: 1, scale: 1, rotate: 0, x: "-50%"}}
                                                    animate={{y: -56, opacity: 0, scale: 0.4, rotate: Math.random() * 90 - 45, x: `${Math.random() * 100 - 50}%`}}
                                                    exit={{opacity: 0}}
                                                    transition={{duration: 0.8, ease: "easeOut"}}
                                                    className="absolute left-1/2 top-0 pointer-events-none text-accent"
                                                >
                                                  <PiHandsClappingFill size={14}/>
                                                </motion.div>
                                            ))}
                                          </AnimatePresence>
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                          {phase === 'thanking' && (
                                              <motion.span
                                                  key="thanks"
                                                  initial={{opacity: 0, x: -10}}
                                                  animate={{opacity: 1, x: 0}}
                                                  exit={{opacity: 0, x: -4}}
                                                  transition={{duration: 0.15, ease: [0.4, 0, 0.2, 1]}}
                                                  onMouseEnter={handleClapEnter}
                                                  onMouseLeave={handleClapLeave}
                                                  className="whitespace-nowrap text-sm text-accent/60"
                                              >
                                                {t('clap-thanks')}
                                              </motion.span>
                                          )}
                                          {phase !== 'thanking' && isHovering && canPrompt && (
                                              <motion.span
                                                  key="prompt"
                                                  initial={{opacity: 0, x: -10}}
                                                  animate={{opacity: 1, x: 0}}
                                                  exit={{opacity: 0, x: -4}}
                                                  transition={{duration: 0.15, ease: [0.4, 0, 0.2, 1]}}
                                                  onMouseEnter={handleClapEnter}
                                                  onMouseLeave={handleClapLeave}
                                                  className="whitespace-nowrap text-sm text-accent/60"
                                              >
                                                {t('clap-prompt')}
                                              </motion.span>
                                          )}
                                          {phase !== 'thanking' && displayClaps > 0 && !(isHovering && canPrompt) && (
                                              <motion.span
                                                  key="count"
                                                  initial={{opacity: 0, x: -10}}
                                                  animate={{opacity: 1, x: 0}}
                                                  exit={{opacity: 0, x: -4}}
                                                  transition={{duration: 0.2, ease: [0.4, 0, 0.2, 1]}}
                                                  onMouseEnter={handleClapEnter}
                                                  onMouseLeave={handleClapLeave}
                                                  className={`whitespace-nowrap font-code text-sm inline-flex items-center cursor-pointer pointer-events-none ${isClapped || isHovering ? "text-accent" : "text-foreground/60"}`}
                                              >
                                                <NumberFlow value={displayClaps}/>
                                              </motion.span>
                                          )}
                                        </AnimatePresence>
                                    </div>
                                  </div>
                              )}
                            </div>
                            {showImagePreview && <ImagePreview images={moment.photos!}/>}
                          </motion.div>
                      ) : null
                  ) : (
                      <motion.p
                          key="article"
                          initial={{opacity: 0}}
                          animate={{opacity: 1}}
                          exit={{opacity: 0}}
                          transition={{duration: 0.2}}
                          className="text-foreground/80"
                      >
                        {moment.description}
                      </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </GlassPanel>
          </Card>
        </motion.div>

        {isTweet && (
            <TweetModal
                isLoading={isLoading && isNotionPost}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                recordMap={isNotionPost ? (recordMap || undefined) : undefined}
                metadata={moment}
            />
        )}
      </>
  )
}

function ImagePreview({images}: { images: string[] }) {
  if (images.length === 0) return null;
  const displayImages = images.slice(0, 6);

  const gridClass = displayImages.length === 1 ? 'md:grid-cols-1' :
      displayImages.length === 2 ? 'md:grid-cols-2' :
          displayImages.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
      <div
          className={`flex flex-col md:grid ${gridClass} gap-2 mt-2`}
          role="list"
          aria-label="Images"
      >
        {displayImages.map((image, i) => (
            <div
                key={i}
                role="listitem"
                className="relative w-full h-36 overflow-hidden"
            >
              <Image
                  src={image}
                  alt=""
                  fill
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-[calc(var(--radius-md)*1.5)] object-cover"
              />
            </div>
        ))}
      </div>
  )
}

function NotionPageSkeleton() {
  return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-lg"/>
        <Skeleton className="h-4 w-3/4 rounded-lg"/>
        <Skeleton className="h-4 w-5/6 rounded-lg"/>
      </div>
  )
}

export function TweetContentSkeleton(
    {images, hasDescription}: { images?: number[]; hasDescription?: boolean }
) {
  const gridClass = !images ? '' :
      images.length === 1 ? 'md:grid-cols-1' :
          images.length === 2 ? 'md:grid-cols-2' :
              images.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
      <>
        <Skeleton className="rounded-lg max-w-[24rem] h-6 mt-4"/>
        <Skeleton className="rounded-lg max-w-lg mt-2 h-6"/>

        {images && images.length > 0 && (
            <div className={`flex flex-col md:grid ${gridClass} gap-2 my-3`}>
              {images.map((_, i) => (
                  <Skeleton
                      key={i}
                      className="rounded-lg w-full h-36"
                  />
              ))}
            </div>
        )}

        {hasDescription ?
            <div className="grid lg:grid-cols-6 mt-4 gap-2">
              <Skeleton className="rounded-lg h-10"/>
              <Skeleton className="rounded-lg lg:col-span-5 h-10"/>
            </div>
            :
            <Skeleton className="rounded-lg w-full mt-2 h-10"/>
        }
      </>
  )
}

interface MomentCardSkeletonProps {
  moment: PostMetadata;
  locale?: string;
}

export function MomentCardSkeleton({moment, locale: propLocale}: MomentCardSkeletonProps) {
  const isTweet = moment.type === "Tweet"
  const hookLocale = useLocale()
  const locale = propLocale || hookLocale

  return (
      <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4, ease: [0.4, 0, 0.2, 1]}}
      >
        <Card className="relative bg-accent/0 shadow-none hover:bg-accent/5 transition-all duration-500 ease-out">
          <div className="flex items-center gap-1">
            {moment.icon && <span className="mr-1" aria-hidden="true">{moment.icon}</span>}
            <span className="text-xl font-semibold">{moment.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-content3-foreground mb-1">
            {moment.platform && moment.platform !== 'notion' && moment.social?.username && (
                <>
                  <span>@{moment.social.username}</span>
                  <span className="mx-0.5">·</span>
                </>
            )}
            <span>{formatDate(moment.created_time, locale, true)}</span>
            {moment.platform && moment.platform !== 'notion' && (
                <span> {moment.created_time.toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}</span>
            )}
            {!isTweet && moment.readingTime && (
                <>
                  <span className="mx-0.5">·</span>
                  <span>{moment.readingTime}</span>
                </>
            )}
            {moment.tags && moment.tags.length > 0 && (
                <Tags tags={moment.tags} size="sm"/>
            )}
          </div>

          <div className="space-y-3">
            {isTweet ? (
                <TweetContentSkeleton
                    hasDescription={!!moment.description}
                    images={moment.photos?.length ? Array(moment.photos.length).fill(0) : undefined}
                />
            ) : (
                <p className="text-foreground/80">{moment.description}</p>
            )}
          </div>
        </Card>
      </motion.div>
  )
}
