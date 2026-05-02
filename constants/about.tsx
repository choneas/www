import type { SocialLink, TechStack } from "@/lib/social-feeds";

// Social
import { MdMail } from "react-icons/md";
import { FaBilibili, FaBluesky, FaXTwitter, FaGithub, FaDiscord } from "react-icons/fa6";

// Teach Stack
import { FaReact, FaNodeJs, FaPython } from "react-icons/fa6";
import { SiNextdotjs, SiTypescript, SiMongodb, SiTailwindcss, SiHeroui } from "react-icons/si";

export const socialLinks: SocialLink[] = [
    {
        platform: "Bilibili",
        name: "Choneas",
        icon: <FaBilibili />,
        href: "https://space.bilibili.com/628078791",
    },
    {
        platform: "Discord",
        name: "Choneas",
        icon: <FaDiscord />,
    },
    {
        platform: "Github",
        icon: <FaGithub />,
        href: "https://github.com/Choneas"
    },
    {
        platform: "Bluesky",
        icon: <FaBluesky />,
        href: "https://bsky.app/profile/choneas.com"
    },
    {
        platform: "Twitter",
        icon: <FaXTwitter />,
        href: "https://x.com/littlephoenixxx"
    },
    {
        platform: "Mail",
        icon: <MdMail size={30} />,
        href: "mailto:me@choneas.com"
    }
]

export const techStacks: TechStack[] = [
    {
        name: "React",
        icon: <FaReact />,
        href: "https://react.dev"
    },
    {
        name: "Python",
        icon: <FaPython />,
        href: "https://python.org"
    },
    {
        name: "TypeScript",
        icon: <SiTypescript />,
        href: "https://www.typescriptlang.org/"
    },
    {
        name: "Next.js",
        icon: <SiNextdotjs />,
        href: "https://nextjs.org"
    },
    {
        name: "Node.js",
        icon: <FaNodeJs />,
        href: "https://nodejs.org/"
    },
    {
        name: "MongoDB",
        icon: <SiMongodb />,
        href: "https://www.mongodb.com/"
    },
    {
        name: "HeroUI",
        icon: <SiHeroui />,
        href: "https://heroui.com/"
    },
    {
        name: "TailwindCSS",
        icon: <SiTailwindcss />,
        href: "https://tailwindcss.com/"
    }
]