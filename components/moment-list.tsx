import { Suspense } from "react";
import { Card, Skeleton } from "@heroui/react";
import { getTranslations, getLocale } from "next-intl/server";
import { HLine } from "@/app/page";
import { MomentCard, MomentCardSkeleton } from "@/components/moment-card";
import { getAllPosts } from "@/lib/content";

interface MomentListProps {
    sortOrder?: 'asc' | 'desc';
}

export async function MomentList({ sortOrder = 'desc' }: MomentListProps) {
    const t = await getTranslations("Tag");
    const locale = await getLocale();

    // Pass translator and locale to getAllPosts (data is cached internally)
    const { tweets, articles } = await getAllPosts(
        (key: string) => t(key),
        locale
    );

    const moments = [...tweets, ...articles];
    moments.sort((a, b) => {
        const comparison = new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
        return sortOrder === 'desc' ? comparison : -comparison;
    });

    return (
        <div className="flex flex-col">
            {moments.map((moment, index) => (
                <div
                    key={moment.id}
                >
                    <Suspense fallback={<MomentCardSkeleton moment={moment} locale={locale} />}>
                        <MomentCard moment={moment} />
                    </Suspense>
                    {index < moments.length - 1 && <HLine className="relative left-0 md:left-auto" />}
                </div>
            ))}
        </div>
    );
}

export async function MomentListSkeleton() {
    return (
        <div className="flex flex-col">
            {[1, 2, 3].map((i, index, arr) => (
                <div
                    key={i}
                    className={`${index < arr.length - 1 && 'border-b-2 border-accent/20'} space-y-6`}
                >
                    <Card className="relative rounded-none bg-background/40 md:bg-background/20 shadow-none ease-out">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <Skeleton className="h-3 w-32 rounded-lg" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>

                        <Skeleton className="h-6 w-3/4 rounded-lg mb-2" />

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-4 w-5/6 rounded-lg" />
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
}
