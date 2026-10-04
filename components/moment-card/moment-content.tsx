import { Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import { LuMessageCircle } from "react-icons/lu"
import type { ExtendedRecordMap } from "notion-types"
import type { PostMetadata } from "@/lib/content"
import { ImagePreview } from "./media-grid"
import { ClapCluster, type ClapClusterProps } from "./clap-cluster"
import { NotionPageSkeleton, MomentContentSkeleton } from "./skeletons"

const NotionPage = dynamic(() => import("@/components/notion-page"), {
  loading: () => <NotionPageSkeleton />,
  ssr: false
})

export interface MomentContentProps {
  moment: PostMetadata;
  isTweet: boolean;
  isNotionPost: boolean;
  isLoading: boolean;
  recordMap: ExtendedRecordMap | null;
  showImagePreview: boolean;
  hasPhotos: boolean;
  photos: string[];
  needsExpansion: boolean;
  isExpanded: boolean;
  measureRef: (node: HTMLDivElement | null) => void;
  onViewAll: () => void;
  clap: ClapClusterProps;
}

export function MomentContent({
  moment,
  isTweet,
  isNotionPost,
  isLoading,
  recordMap,
  showImagePreview,
  hasPhotos,
  photos,
  needsExpansion,
  isExpanded,
  measureRef,
  onViewAll,
  clap
}: MomentContentProps) {
  const t = useTranslations('Moment')

  return (
    <motion.div
      className="space-y-3 -ml-0.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {isTweet ? (
          !isNotionPost ? (
            <motion.div
              key="social"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative min-h-16">
                <div className="tweet-preview relative pointer-events-none">
                  <p className="text-foreground/90 text-base! whitespace-pre-wrap">{moment.description}</p>
                </div>
              </div>
              {showImagePreview && <ImagePreview images={photos} label={t('images-label')} alt={moment.title || t('photo-alt')} />}
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MomentContentSkeleton
                hasDescription={!!moment.description}
                images={showImagePreview && hasPhotos ? Array(photos.length).fill(0) : undefined}
              />
            </motion.div>
          ) : recordMap ? (
            <motion.div
              key="loaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                {moment.description ? (
                  <div className="flex items-start gap-2 text-foreground/80">
                    <LuMessageCircle size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
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
                      <Suspense fallback={<NotionPageSkeleton />}>
                        <NotionPage recordMap={recordMap} type="tweet-preview" />
                      </Suspense>
                    </div>

                    {needsExpansion && !isExpanded && (
                      <div className="-mt-7 pb-1">
                        <button
                          type="button"
                          onClick={onViewAll}
                          className="text-sm text-accent/70 hover:text-accent underline underline-offset-4 transition-colors cursor-pointer"
                        >
                          {t('view-more')}
                        </button>
                      </div>
                    )}

                    <ClapCluster {...clap} />
                  </div>
                )}
              </div>
              {showImagePreview && <ImagePreview images={photos} label={t('images-label')} alt={moment.title || t('photo-alt')} />}
            </motion.div>
          ) : null
        ) : (
          <motion.p
            key="article"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-foreground/80"
          >
            {moment.description}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
