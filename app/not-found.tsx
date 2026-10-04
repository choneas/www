import { Button } from "@heroui/react"
import { GoHomeFill } from "react-icons/go"
import Image from "next/image"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function NotFound() {
    const t = await getTranslations("NotFound");

    return (
        <div className="flex flex-col justify-center items-center space-y-6 mt-24">
            <h1>4 🫥 4</h1>
            <p>{t("title")}</p>

            <Image
                unoptimized
                alt={t("image-alt")}
                src="/images/theresa-nod.gif"
                width={200}
                height={200}
            />

            <Button variant="primary" size="lg">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                    <GoHomeFill />
                    {t("go-home")}
                </Link>
            </Button>
        </div>
    )
}
