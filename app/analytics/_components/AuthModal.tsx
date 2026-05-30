"use client"

import { useState } from 'react'
import { Modal, Input, Button, Chip } from "@heroui/react"
import { useTranslations } from "next-intl"

interface AuthModalProps {
    onSuccess: () => void
}

export function AuthModal({ onSuccess }: AuthModalProps) {
    const t = useTranslations("Analytics")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!password) return
        setLoading(true)
        setError(false)
        try {
            const res = await fetch("/api/analytics/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            })
            const data = await res.json()
            if (data.ok) {
                sessionStorage.setItem("analytics_authed", "true")
                onSuccess()
            } else {
                setError(true)
            }
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal.Backdrop
            isOpen
            onClose={() => {}}
            variant="opaque"
            isDismissable={false}
            isKeyboardDismissDisabled
            className="flex items-center justify-center"
        >
            <Modal.Container>
                <Modal.Dialog aria-label={t("auth-title")} className="max-w-sm p-6 overscroll-contain">
                    <h2 className="text-lg font-semibold mb-2">{t("auth-title")}</h2>
                    <p className="text-foreground/70 text-sm mb-4">{t("auth-description")}</p>
                    <Input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder={t("auth-placeholder")}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false) }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                        autoFocus
                        isDisabled={loading}
                    />
                    {error && (
                        <Chip color="danger" variant="flat" size="sm" className="mt-3" role="alert" aria-live="assertive">
                            {t("auth-error")}
                        </Chip>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button
                            color="primary"
                            onPress={handleSubmit}
                            isLoading={loading}
                            isDisabled={!password}
                        >
                            {t("auth-submit")}
                        </Button>
                    </div>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    )
}
