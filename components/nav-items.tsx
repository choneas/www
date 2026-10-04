import { ReactNode } from 'react';

import {
    BsPenFill,
    BsPen
} from "react-icons/bs";
import {
    PiAtomFill,
    PiAtom
} from "react-icons/pi";
import {
    FaCircleInfo
} from "react-icons/fa6";
import {
    FiInfo
} from "react-icons/fi";

interface NavItemIcon {
    filled: ReactNode;
    outline: ReactNode;
}

interface NavItem {
    name: string;
    description?: string;
    icon: NavItemIcon;
    href: string;
}

/**
 * Navigation items configuration with filled and outline icon variants
 * Each item has both filled (active state) and outline (inactive state) icons
 */
const navItems: NavItem[] = [
    {
        name: "articles",
        icon: {
            filled: <BsPenFill size={28} />,
            outline: <BsPen size={28} />
        },
        href: "/article",
    },
    {
        name: "projects",
        icon: {
            filled: <PiAtomFill size={28} />,
            outline: <PiAtom size={28} />
        },
        href: "/project",
    },
    {
        name: "about",
        icon: {
            filled: <FaCircleInfo size={28} />,
            outline: <FiInfo size={28} />
        },
        href: "/about",
    },
];

export { navItems };
export type { NavItem, NavItemIcon };