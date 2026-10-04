import { Card, Skeleton } from "@heroui/react"
import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import { Tags } from "@/components/tags"
import type { PostMetadata } from "@/lib/content"
import { formatDate } from "@/utils/date-format"
import { gridClassForCount } from "./media-grid"

export function NotionPageSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-5/6 rounded-lg" />
    </div>
  )
}

export function MomentContentSkeleton(
  { images, hasDescription }: { images?: number[]; hasDescription?: boolean }
) {
  return (
    <>
      <Skeleton className="rounded-lg max-w-[24rem] h-6 mt-4" />
      <Skeleton className="rounded-lg max-w-lg mt-2 h-6" />

      {images && images.length > 0 && (
        <div className={`flex flex-col md:grid ${gridClassForCount(images.length)} gap-2 my-3`}>
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
          <Skeleton className="rounded-lg h-10" />
          <Skeleton className="rounded-lg lg:col-span-5 h-10" />
        </div>
        :
        <Skeleton className="rounded-lg w-full mt-2 h-10" />
      }
    </>
  )
}

interface MomentCardSkeletonProps {
  moment: PostMetadata;
  locale?: string;
}

export function MomentCardSkeleton({ moment, locale: propLocale }: MomentCardSkeletonProps) {
  const isTweet = moment.type === "Tweet"
  const hookLocale = useLocale()
  const locale = propLocale || hookLocale

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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
            <Tags tags={moment.tags} size="sm" />
          )}
        </div>

        <div className="space-y-3">
          {isTweet ? (
            <MomentContentSkeleton
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
