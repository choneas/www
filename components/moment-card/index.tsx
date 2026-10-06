'use client'

import { Card } from "@heroui/react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { motion } from "framer-motion"
import { useClapSession } from "@/hooks/use-clap-session"
import { getCookie } from "@/utils/actions-cookie"
import { GlassPanel } from "@/components/home/glass-panel";
import { MomentModal } from "@/components/moment-modal"
import type { ExtendedRecordMap } from "notion-types"
import type { PostMetadata } from "@/lib/content"
import { getPostRecordMap } from "@/lib/content"
import { trackView } from "@/utils/track-view"
import { useViewCount } from "@/hooks/use-view-count"
import { MomentHeader } from "./moment-header"
import { MomentContent } from "./moment-content"
import { getExternalUrl } from "./moment-links"

export { MomentCardSkeleton, MomentContentSkeleton } from "./skeletons"

interface MomentCardProps {
  moment: PostMetadata;
}

export function MomentCard({ moment }: MomentCardProps) {
  const isTweet = moment.type === "Tweet"
  const isNotionPost = moment.platform === 'notion' || !moment.platform
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
    const id = moment.id
    if (!isTweet || !isNotionPost || !id) return
    const fetchPost = async () => {
      try {
        const { recordMap: data } = await getPostRecordMap(id, true)
        setRecordMap(data)
      } catch {
        // Loading UI already covers the failure state; nothing to report.
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

  const handleCardClick = () => {
    const externalUrl = getExternalUrl(moment);
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else if (isTweet) {
      setIsModalOpen(true)
    } else {
      router.push('/article/' + (moment.slug || moment.id))
    }
  }

  const handleOpenInNewTab = () => {
    const externalUrl = getExternalUrl(moment);
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      const url = isTweet ? `/moment/${moment.slug || moment.id}` : `/article/${moment.slug || moment.id}`
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

  const hasPhotos = moment.photos != null && moment.photos.length > 0
  const showImagePreview = hasPhotos && (isNotionPost ? moment.imagePreview === true : true)
  const photos: string[] = showImagePreview && moment.photos ? moment.photos : []
  const externalUrl = getExternalUrl(moment)
  const articleHref = !isTweet && !externalUrl ? `/article/${moment.slug || moment.id}` : null
  const titleHref = externalUrl ?? articleHref
  const titleExternal = Boolean(externalUrl)
  const handleTitleActivate = () => {
    if (externalUrl || articleHref) handleCardClick()
    else if (isTweet) setIsModalOpen(true)
  }
  const showTitleLink = Boolean(titleHref) || isTweet
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return
    if (isNotionPost) handleCardClick()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <Card
          onClick={handleBackgroundClick}
          className={`relative min-h-auto bg-transparent p-0 shadow-none rounded-none${isNotionPost ? " cursor-pointer" : ""}`}
        >
          <GlassPanel
            className="backdrop-saturate-100 bg-background/40 hover:bg-background/90 transition-all duration-150 ease-out px-6 py-4 md:py-6 mx-0.5">
            <MomentHeader
              moment={moment}
              locale={locale}
              views={views}
              isTweet={isTweet}
              isNotionPost={isNotionPost}
              onOpenInNewTab={handleOpenInNewTab}
              titleHref={titleHref}
              titleExternal={titleExternal}
              onTitleActivate={showTitleLink ? handleTitleActivate : undefined}
            />
            <MomentContent
              moment={moment}
              isTweet={isTweet}
              isNotionPost={isNotionPost}
              isLoading={isLoading}
              recordMap={recordMap}
              showImagePreview={showImagePreview}
              hasPhotos={hasPhotos}
              photos={photos}
              needsExpansion={needsExpansion}
              isExpanded={isExpanded}
              measureRef={measureRef}
              onViewAll={handleViewAllClick}
              clap={{
                displayClaps,
                isClapped,
                isHovering,
                canPrompt,
                phase,
                floatingClaps,
                onClap: handleClapClick,
                onEnter: handleClapEnter,
                onLeave: handleClapLeave
              }}
            />
          </GlassPanel>
        </Card>
      </motion.div>

      {isTweet && (
        <MomentModal
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
