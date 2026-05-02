import { Link } from "@heroui/react";
import { navItems } from "@/constants/navbar";

interface NavbarMenuProps {
    pathname: string;
    translations: Record<string, string>;
}

/**
 * NavbarMenu 客户端组件
 * 显示移动端菜单
 */
export function NavbarMenu({ pathname, translations }: NavbarMenuProps) {
    return (
        <div className="flex flex-col gap-2">
            {
                navItems.map((item, index) => {
                    const isActive = pathname.includes(item.href) && pathname !== "/";
                    // Use filled icon when active, outline when inactive
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
