"use client"

import * as React from 'react'
import { Link, Typography } from '@heroui/react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { type ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'
import { useTheme } from '@/components/theme-provider'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'

// Optimize dynamic imports with better loading states and SSR settings
const Code = dynamic(() =>
    import('react-notion-x/build/third-party/code').then((m) => m.Code),
    {
        ssr: false,
        loading: () => <div className="bg-content2 rounded p-2 animate-pulse h-20" />
    }
)

const Collection = dynamic(() =>
    import('react-notion-x/build/third-party/collection').then(
        (m) => m.Collection
    ),
    {
        ssr: false,
    }
)

const Equation = dynamic(() =>
    import('react-notion-x/build/third-party/equation').then((m) => m.Equation),
    {
        loading: () => <div className="bg-content2 rounded p-2 animate-pulse h-8 w-24" />
    }
)

const Pdf = dynamic(
    () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
    {
        ssr: false,
        loading: () => <div className="bg-content2 rounded p-4 animate-pulse h-96" />
    }
)

const Modal = dynamic(
    () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
    {
        ssr: false
    }
)

interface NotionPageProps {
    className?: string;
    recordMap: ExtendedRecordMap;
    type?: "tweet-preview" | "tweet-details";
}

const NotionPage = ({ className = '', recordMap, type }: NotionPageProps) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isPreview = type === "tweet-preview";
    const isTweetDetails = type === "tweet-details";
    const typeClass = isPreview
        ? " notion tweet-preview"
        : isTweetDetails
            ? " notion main-content tweet-details"
            : " notion main-content";

    return (
        <div className={className + typeClass}>
            <Typography.Prose>
                <NotionRenderer
                    disableHeader
                    recordMap={recordMap}
                    darkMode={mounted ? resolvedTheme === 'dark' : false}
                    fullPage={false}
                    components={{
                        Code,
                        Collection,
                        Equation,
                        Modal,
                        Pdf,
                        nextImage: Image,
                        nextLink: Link
                    }}
                />
            </Typography.Prose>
        </div>
    )
}

// NOTE: Notion tables render with the default react-notion-x markup for now.
// Rewriting them with the HeroUI 3.2 compound Table API is a separate task.

export default NotionPage;
