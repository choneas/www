import { cn } from "@heroui/react";

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("backdrop-blur-lg backdrop-saturate-150 bg-surface/60", className)}>
            {children}
        </div>
    );
}