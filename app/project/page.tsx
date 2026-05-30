import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { projects } from "@/constants/project"
import { ProjectCard } from "@/components/project-card"

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Project')
    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: 'website',
            url: '/project',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
        },
    }
}

export default async function Project() {
    const t = await getTranslations("Project")

    return (
        <main id="main-content" className="main-content container mx-auto px-8 sm:mt-20 sm:px-24 pt-8">
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>

            <div className="mt-8">
                <div className="flex flex-col gap-6">
                    {projects.map((project, index) => (
                        <ProjectCard key={project.name || index} project={project} />
                    ))}
                </div>
            </div>
        </main>
    )
}