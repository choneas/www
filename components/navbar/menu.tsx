import { Link } from "@heroui/react";
import { navItems } from "@/components/nav-items";

interface NavbarMenuProps {
    pathname: string;
    translations: Record<string, string>;
}

/**
 * NavbarMenu client component
 * Renders the mobile menu links
 */
export function NavbarMenu({ pathname, translations }: NavbarMenuProps) {
    return (
        <div className="flex flex-col gap-2">
            {
                navItems.map((item, index) => {
                    const isActive = pathname.includes(item.href) && pathname !== "/";
                    const currentIcon = isActive ? item.icon.filled : item.icon.outline;

                    return (
                        <Link
                            key={index}
                            href={isActive ? "/" : item.href}
                            className={`flex justify-start gap-2 py-2 ${isActive ? "font-bold" : ""}`}
                        >
                            {currentIcon}
                            {translations[item.name]}
                        </Link>
                    );
                })
            }
        </div>
    )
}
