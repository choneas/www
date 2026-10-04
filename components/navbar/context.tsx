"use client"

import { createContext, useContext } from "react";
import { MotionValue } from "framer-motion";

interface NavbarContextType {
    scrollY: MotionValue<number>;
    navbarBlur: MotionValue<number>;
    pathname: string;
}

export const NavbarContext = createContext<NavbarContextType | null>(null);

export function useNavbarContext() {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error("useNavbarContext must be used within a NavbarProvider");
    }
    return context;
}
