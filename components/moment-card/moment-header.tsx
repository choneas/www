import { Button } from "@heroui/react"
import { useTranslations } from "next-intl"
import { FaXTwitter } from "react-icons/fa6"
import { SiBluesky } from "react-icons/si"
import { Tags } from "@/components/tags"
import type { PostMetadata } from "@/lib/content"
import { formatDate } from "@/utils/date-format"

const platformIcons: Record<string, typeof FaXTwitter> = {
  x: FaXTwitter,
  bluesky: SiBluesky,
}

function getOpenLabel(moment: PostMetadata, t: (key: string) => string): string {
  if (moment.platform === 'x') return t('view-on-x');
  if (moment.platform === 'bluesky') return t('view-on-bluesky');
  return t('open-in-new-tab');
}

interface MomentHeaderProps {
  moment: PostMetadata;
  locale: string;
  views: number | null;
  isTweet: boolean;
  isNotionPost: boolean;
  onOpenInNewTab: () => void;
}

export function MomentHeader({ moment, locale, views, isTweet, isNotionPost, onOpenInNewTab }: MomentHeaderProps) {
  const t = useTranslations('Moment')

  const platform = moment.platform
  const PlatformIcon = platform ? platformIcons[platform] : undefined

  return (
    <>
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {moment.type !== 'Article' && PlatformIcon && (
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label={getOpenLabel(moment, t)}
            onPress={onOpenInNewTab}
            className="text-accent"
          >
            <PlatformIcon size={20} />
          </Button>
        )}
      </div>

      {(isNotionPost || moment.title) && (
        <span className="text-xl font-semibold">
          {moment.icon && <span className="mr-1" aria-hidden="true">{moment.icon}</span>}
          {moment.title}
        </span>
      )}

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
        {views != null && views > 0 && (
          <>
            <span className="mx-0.5">·</span>
            <span>{views} {t('views')}</span>
          </>
        )}
        {moment.tags && moment.tags.length > 0 && (
          <Tags tags={moment.tags} size="sm" />
        )}
      </div>
    </>
  )
}
