import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import ArticleNotFoundError, { getPost } from "@/lib/content";

export default async function SmartRoute({
    params,
}: {
    params: Promise<{ post: string }>,
}) {
    const post = (await params).post;
    const tagT = await getTranslations("Tag");
    const locale = await getLocale();

    try {
        const { metadata } = await getPost(
            post,
            (key: string) => tagT(key),
            locale,
            true
        );

        if (metadata.type === "Tweet") {
            redirect(`/moment/${metadata.slug || metadata.id}`);
        } else {
            redirect(`/article/${metadata.slug || metadata.id}`);
        }
    } catch (error) {
        if (error instanceof ArticleNotFoundError) {
            redirect(`/article/${post}`);
        }
        throw error;
    }
}
