"use client";

import { useState, useEffect } from "react";

interface LiveCounterProps {
    birthDate: string;
    locale: string;
    title: string;
}

interface TimeElapsed {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function calculateElapsed(birthDate: Date): TimeElapsed {
    const now = new Date();
    const start = new Date(birthDate);
    
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes(), start.getSeconds());
    const diff = utcNow - utcStart;

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
        minutes: Math.floor(diff / (1000 * 60)) % 60,
        seconds: Math.floor(diff / 1000) % 60,
    };
}

function formatUnitParts(value: number, unit: Intl.NumberFormatOptions["unit"], locale: string): React.ReactNode {
    const formatter = new Intl.NumberFormat(locale, {
        style: "unit",
        unit,
        unitDisplay: "long",
    });

    return formatter.formatToParts(value).map((part, index) => {
        const key = `${part.type}-${index}`;

        if (part.type === "unit") {
            return <span key={key} className="text-accent/70">{part.value}</span>;
        }

        if (part.type === "integer" || part.type === "group") {
            return <span key={key} className="font-bold text-accent">{part.value}</span>;
        }

        return <span key={key}>{part.value}</span>;
    });
}

export function LiveCounter({ birthDate, locale, title }: LiveCounterProps) {
    const birth = new Date(birthDate);
    const [elapsed, setElapsed] = useState<TimeElapsed | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setElapsed(calculateElapsed(birth));

        const timer = setInterval(() => {
            setElapsed(calculateElapsed(birth));
        }, 1000);

        return () => clearInterval(timer);
    }, [birthDate]);

    if (!mounted || !elapsed) {
        return (
            <div className="text-left">
                <p className="text-glass-bg text-xs md:text-sm text-accent/60 font-medium tracking-widest uppercase md:mb-2">
                    {title}
                </p>
                <p className="text-glass-bg text-sm md:text-lg text-accent/90 font-serif opacity-60">...</p>
            </div>
        );
    }

    const localeBcp = locale.replace("_", "-");
    const timeParts: React.ReactNode[] = [];

    if (elapsed.days > 0) {
        timeParts.push(
            <span key="days">
                {formatUnitParts(elapsed.days, "day", localeBcp)}
            </span>
        );
    }

    if (elapsed.hours > 0) {
        timeParts.push(
            <span key="hours">
                {formatUnitParts(elapsed.hours, "hour", localeBcp)}
            </span>
        );
    }

    if (elapsed.minutes > 0) {
        timeParts.push(
            <span key="minutes">
                {formatUnitParts(elapsed.minutes, "minute", localeBcp)}
            </span>
        );
    }

    timeParts.push(
        <span key="seconds">
            {formatUnitParts(elapsed.seconds, "second", localeBcp)}
        </span>
    );

    const formattedTime: React.ReactNode[] = timeParts.flatMap((part, index) => {
        if (index === 0) return [part];
        return [<span key={`comma-${index}`} className="text-accent/70">, </span>, part];
    });

    return (
        <>
        <div className="text-left">
            <p className="text-glass-bg text-xs md:text-sm text-accent/60 font-medium tracking-widest uppercase mb-2 inline-block">
                {title}
            </p>
        </div>
        <div className="text-left">
            <p className="text-glass-bg text-sm md:text-lg text-accent/90 font-serif inline-block">
                {formattedTime}
            </p>
        </div>
        </>
    );
}
