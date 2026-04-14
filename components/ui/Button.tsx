"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-gold text-black hover:bg-gold-muted shadow-lg shadow-gold/10",
      secondary: "bg-zinc-900 text-gold hover:bg-zinc-800 border border-zinc-800",
      outline: "bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black",
      ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    const MotionButton = motion.button as any;

    return (
      <MotionButton
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative inline-flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = "Button";
