import { useEffect, useRef } from "react";
import { Modal, ScrollShadow } from "@heroui/react";
import type { ExtendedRecordMap } from "notion-types";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { PostHeader } from "@/components/post-header";
import NotionPage from "@/components/notion-page";
import { Comment } from "@/components/comment";
import { TweetContentSkeleton } from "@/components/moment-card";
import { formatDate } from "@/utils/date-format";
import { PostMetadata } from "@/lib/content";

interface TweetModalProps {
    isLoading?: boolean;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    recordMap?: ExtendedRecordMap;
    metadata: PostMetadata;
}

export function TweetModal({
    isLoading,
    isOpen,
    onOpenChange,
    recordMap,
    metadata
}: TweetModalProps) {
    const locale = useLocale();
    const t = useTranslations("Metadata");
    const originalTitleRef = useRef<string>("");

    useEffect(() => {
        if (typeof window === 'undefined') return;
        // Only update title for Notion posts, not for social platform posts
        const isNotionPost = metadata.platform === 'notion' || !metadata.platform;
        if (!isNotionPost) return;

        if (isOpen) {
            // Save original title when opening modal
            originalTitleRef.current = document.title;
            document.title = (metadata.title || formatDate(metadata.created_time, locale, true)) + t("suffix");

            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute("content", metadata.description || "");
            }

            let metaBacklink = document.querySelector('meta[name="giscus:backlink"]');
            if (!metaBacklink) {
                metaBacklink = document.createElement("meta");
                metaBacklink.setAttribute("name", "giscus:backlink");
                document.head.appendChild(metaBacklink);
            }
            metaBacklink.setAttribute("content", `https://choneas.com/tweet/${metadata.slug || metadata.id}`);
        } else if (originalTitleRef.current) {
            // Only restore title if we have a saved original title
            document.title = originalTitleRef.current;
        }
    }, [isOpen, metadata, locale, t]);

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            isDismissable={true}
            onOpenChange={onOpenChange}
            variant="blur"
        >
            <Modal.Container
                className="pt-0 pb-8 px-0 md:p-4"
                placement="top"
                scroll="outside"
            >
                <Modal.Dialog
                    className="container mx-auto p-6 sm:px-10 md:px-14 md:max-w-3xl rounded-none md:rounded-3xl relative overflow-hidden"
                    aria-label={metadata.title || formatDate(metadata.created_time, locale, true)}
                >
                    <Modal.CloseTrigger className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 transition-colors rounded-full" />
                    <ScrollShadow className="max-h-[80vh]" hideScrollBar>
                        <Modal.Header className="px-4">
                            {!isLoading && <PostHeader isTweet post={metadata} />}
                        </Modal.Header>
                        <Modal.Body className="px-4 pb-4 transition-transform duration-100">
                            <div className="space-y-4">
                                {isLoading ? (
                                    <TweetContentSkeleton
                                        images={metadata.photos?.length ? Array(metadata.photos.length).fill(0) : undefined}
                                    />
                                ) : metadata.platform != 'notion' ? (
                                    <>
                                        <p className="text-foreground/90 text-base whitespace-pre-wrap">{metadata.description}</p>
                                        {metadata.photos && metadata.photos.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                {metadata.photos.map((photo, i) => (
                                                    <div key={i} className="relative w-full h-64 overflow-hidden rounded-lg">
                                                        <Image
                                                            src={photo}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : recordMap ? (
                                    <>
                                        <NotionPage recordMap={recordMap} type="tweet-details" />
                                        <Comment type="tweet" metadata={metadata} />
                                    </>
                                ) : (
                                    <p className="text-md">
                                        Detail will be available once the content finishes loading.
                                    </p>
                                )}
                            </div>
                        </Modal.Body>
                    </ScrollShadow>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
