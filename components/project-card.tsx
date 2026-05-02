"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Card, Link } from "@heroui/react";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import type { Project, GithubRepoInfo } from "@/lib/social-feeds";
import { formatDate } from "@/utils/date-format";
import { fetchGithubRepoInfo } from "@/utils/github";

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const [repoInfo, setRepoInfo] = useState<GithubRepoInfo | null>(null);
    const [error, setError] = useState<boolean>(false);
    const locale = useLocale();
    const t = useTranslations('Project');

    const finalLink = project.isGithubRepo && project.repo
        ? `https://github.com/${project.repo}`
        : project.link;

    useEffect(() => {
        if (project.isGithubRepo && project.repo) {
            fetchGithubRepoInfo(project.repo)
                .then(data => {
                    if (!data) {
                        setError(true);
                        return;
                    }
                    setRepoInfo(data);
                })
                .catch(() => setError(true));
        }
    }, [project.repo, project.isGithubRepo]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Link
                href={finalLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block no-underline"
            >
                <Card className="w-full transition-all duration-200" variant="default">
                    {project.cover && (
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src={project.cover}
                                alt={project.name || ''}
                                fill
                                className="object-cover transition-transform duration-300 hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    )}

                    <Card.Header className="gap-2">
                        <Card.Title className="text-xl font-semibold">
                            {project.name}
                        </Card.Title>
                        {project.link && (
                            <div className="flex items-center gap-1 text-sm text-muted">
                                <span>{new URL(project.link).hostname}</span>
                                <span className="text-xs">↗</span>
                            </div>
                        )}
                    </Card.Header>

                    <Card.Content>
                        {error ? (
                            <p className="text-danger text-sm">{t('error.fetch-failed')}</p>
                        ) : (
                            <Card.Description className="text-base leading-relaxed">
                                {project.isGithubRepo ? repoInfo?.description : project.description}
                            </Card.Description>
                        )}
                    </Card.Content>

                    {project.isGithubRepo && repoInfo && !error && (
                        <Card.Footer className="flex items-center gap-3 text-sm text-muted">
                            <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-500" size={14} />
                                <span>{repoInfo.stargazers_count}</span>
                            </div>
                            <span>·</span>
                            <span>{formatDate(new Date(repoInfo.updated || ''), locale)}</span>
                        </Card.Footer>
                    )}
                </Card>
            </Link>
        </motion.div>
    )
}