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
  titleHref?: string | null;
  titleExternal?: boolean;
  onTitleActivate?: () => void;
}

export function MomentHeader({ moment, locale, views, isTweet, isNotionPost, onOpenInNewTab, titleHref, titleExternal, onTitleActivate }: MomentHeaderProps) {
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
            className="relative z-10 text-accent"
          >
            <PlatformIcon size={20} />
          </Button>
        )}
      </div>

      {(isNotionPost || moment.title) && (
        titleHref ? (
          <a
            href={titleHref}
            target={titleExternal ? "_blank" : undefined}
            rel={titleExternal ? "noopener noreferrer" : undefined}
            onClick={titleExternal ? undefined : (e) => { e.preventDefault(); onTitleActivate?.(); }}
            className="stretched-link block w-fit text-xl font-semibold hover:text-accent transition-colors"
          >
            {moment.icon && <span className="mr-1" aria-hidden="true">{moment.icon}</span>}
            {moment.title}
          </a>
        ) : onTitleActivate ? (
          <button
            type="button"
            onClick={onTitleActivate}
            className="stretched-link block w-fit text-left text-xl font-semibold hover:text-accent transition-colors cursor-pointer"
          >
            {moment.icon && <span className="mr-1" aria-hidden="true">{moment.icon}</span>}
            {moment.title}
          </button>
        ) : (
          <span className="text-xl font-semibold">
            {moment.icon && <span className="mr-1" aria-hidden="true">{moment.icon}</span>}
            {moment.title}
          </span>
        )
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
