"use client"

import { useEffect, useState } from "react";
import { Dropdown, Spinner, ListBox, Label, Link } from "@heroui/react";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { FiMoreHorizontal, FiGithub } from "react-icons/fi";
import { CgDarkMode } from "react-icons/cg";
import { useTheme } from "@/components/theme-provider";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface NavbarDropdownProps {
    supportedLocales: string[];
    onVisibilityChange?: (isOpen: boolean) => void;
}

export function NavbarDropdown({ supportedLocales, onVisibilityChange }: NavbarDropdownProps) {
    const { theme, setTheme } = useTheme();
    const t = useTranslations("Navbar-Dropdown");
    const router = useRouter();
    const [selectedLang, setSelectedLang] = useState<string>("Accept-Language");
    const [loadingLang, setLoadingLang] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const prefLang = document.cookie.match(/NEXT_PREF_LOCALE=([^;]+)/)?.[1];
        setSelectedLang(prefLang || "Accept-Language");
    }, []);

    const handleLangChange = (key: React.Key) => {
        const keyStr = String(key);
        setSelectedLang(keyStr);
        setLoadingLang(keyStr);
        if (keyStr === "Accept-Language") {
            document.cookie = `NEXT_PREF_LOCALE=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        } else {
            document.cookie = `NEXT_PREF_LOCALE=${keyStr}; path=/`;
        }
        router.refresh();
        setTimeout(() => {
            setLoadingLang(null);
        }, 3200);
    };

    const handleThemeChange = (key: React.Key) => {
        const keyStr = String(key);
        if (keyStr === "light" || keyStr === "dark" || keyStr === "system") {
            setTheme(keyStr);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onVisibilityChange?.(open);
    };

    // Prevent hydration mismatch by not rendering theme UI until mounted
    if (!mounted) {
        return (
            <Dropdown
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
            >
                <Dropdown.Trigger
                    className="flex h-14 w-14 items-center justify-center transition-colors rounded-full outline-none"
                    aria-label={t("preferences")}
                >
                    <FiMoreHorizontal className="text-accent" size={20} />
                </Dropdown.Trigger>
                <Dropdown.Popover
                    placement="bottom end"
                    className="w-auto px-4 py-5 mobile-dropdown-fix-right"
                >
                    <div className="flex flex-col gap-4">
                        <div>
                            <span className="pl-2 text-sm font-medium">{t("prefer-language")}</span>
                            <ListBox
                                aria-label="Language selection"
                                selectionMode="single"
                                selectedKeys={[selectedLang]}
                                onSelectionChange={(keys) => {
                                    const key = Array.from(keys)[0];
                                    if (key) handleLangChange(key);
                                }}
                            >
                                {supportedLocales.map((locale) => (
                                    <ListBox.Item
                                        key={locale}
                                        id={locale}
                                        textValue={locale}
                                        className={selectedLang === locale ? "bg-accent/10" : ""}
                                    >
                                        {loadingLang === locale && <Spinner size="sm" />}
                                        <Label className="font-code text-sm">{locale}</Label>
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                                <ListBox.Item
                                    id="Accept-Language"
                                    textValue="Accept-Language"
                                    className={selectedLang === "Accept-Language" ? "bg-accent/10" : ""}
                                >
                                    {loadingLang === "Accept-Language" && <Spinner size="sm" />}
                                    <Label className="font-code text-sm">Accept-Language</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            </ListBox>
                        </div>

                        <div>
                            <span className="pl-2 text-sm font-medium">{t("prefer-color-scheme")}</span>
                            <ListBox
                                aria-label="Theme selection"
                                selectionMode="single"
                                selectedKeys={["system"]}
                                className=""
                            >
                                <ListBox.Item
                                    id="light"
                                    textValue={t("light")}
                                >
                                    <MdLightMode />
                                    <Label>{t("light")}</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item
                                    id="dark"
                                    textValue={t("dark")}
                                >
                                    <MdDarkMode />
                                    <Label>{t("dark")}</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item
                                    id="system"
                                    textValue={t("system")}
                                    className="bg-accent/10"
                                >
                                    <CgDarkMode />
                                    <Label>{t("system")}</Label>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            </ListBox>
                        </div>

                        <div className="px-2">
                            <span className="text-sm font-medium">{t("view-on")}</span>
                            <Link
                                href={`https://github.com/${process.env.NEXT_PUBLIC_REPO ?? ""}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex w-full items-center gap-2 rounded-full justify-center px-3 py-2 text-sm transition-colors bg-accent/10 hover:bg-accent/20 text-accent no-underline"
                            >
                                <FiGithub className="text-accent" />
                                Github
                            </Link>
                        </div>
                    </div>
                </Dropdown.Popover>
            </Dropdown>
        );
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
        >
            <Dropdown.Trigger
                className="flex h-14 w-14 items-center justify-center transition-colors rounded-full outline-none"
                aria-label={t("preferences")}
            >
                <FiMoreHorizontal className="text-accent" size={20} />
            </Dropdown.Trigger>

            <Dropdown.Popover
                placement="bottom end"
                className="w-72 px-4 py-5 mobile-dropdown-fix-right"
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="pl-2 text-sm font-medium">{t("prefer-language")}</span>
                        <ListBox
                            aria-label="Language selection"
                            selectionMode="single"
                            selectedKeys={[selectedLang]}
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys)[0];
                                if (key) handleLangChange(key);
                            }}
                        >
                            {supportedLocales.map((locale) => (
                                <ListBox.Item
                                    key={locale}
                                    id={locale}
                                    textValue={locale}
                                    className={selectedLang === locale ? "bg-accent/10" : ""}
                                >
                                {loadingLang === locale && <Spinner size="sm" />}
                                <Label className="font-code text-sm">{locale}</Label>
                                <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                            <ListBox.Item
                                id="Accept-Language"
                                textValue="Accept-Language"
                                className={selectedLang === "Accept-Language" ? "bg-accent/10" : ""}
                            >
                                {loadingLang === "Accept-Language" && <Spinner size="sm" />}
                                <Label className="font-mono text-sm">Accept-Language</Label>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        </ListBox>
                    </div>

                    <div>
                        <span className="pl-2 text-sm font-medium">{t("prefer-color-scheme")}</span>
                        <ListBox
                            aria-label="Theme selection"
                            selectionMode="single"
                            selectedKeys={theme ? [theme] : ["system"]}
                            onSelectionChange={(keys) => {
                                const key = Array.from(keys)[0];
                                if (key) handleThemeChange(key);
                            }}
                            className=""
                        >
                            <ListBox.Item
                                id="light"
                                textValue={t("light")}
                                className={theme === "light" ? "bg-accent/10" : ""}
                            >
                                <MdLightMode />
                                <Label>{t("light")}</Label>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item
                                id="dark"
                                textValue={t("dark")}
                                className={theme === "dark" ? "bg-accent/10" : ""}
                            >
                                <MdDarkMode />
                                <Label>{t("dark")}</Label>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item
                                id="system"
                                textValue={t("system")}
                                className={theme === "system" ? "bg-accent/10" : ""}
                            >
                                <CgDarkMode />
                                <Label>{t("system")}</Label>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        </ListBox>
                    </div>

                    <div className="px-2">
                        <span className="text-sm font-medium">{t("view-on")}</span>
                        <Link
                            href={`https://github.com/${process.env.NEXT_PUBLIC_REPO ?? ""}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex w-full items-center gap-2 rounded-full justify-center px-3 py-2 text-sm transition-colors bg-accent/10 hover:bg-accent/20 text-accent no-underline"
                        >
                            <FiGithub className="text-accent" />
                            Github
                        </Link>
                    </div>
                </div>
            </Dropdown.Popover>
        </Dropdown>
    );
}
