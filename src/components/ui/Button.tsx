"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "success" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-md hover:bg-primary-dark",
  secondary: "bg-white text-foreground shadow-md border-2 border-gray-200",
  success: "bg-success text-white shadow-md",
  ghost: "bg-transparent text-foreground",
  danger: "bg-danger text-white shadow-md",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg" | "xl";
}

export function Button({ variant = "primary", size = "lg", className = "", ...rest }: Props) {
  const sizeCls =
    size === "xl"
      ? "min-h-16 px-8 text-2xl"
      : size === "lg"
        ? "min-h-14 px-6 text-xl"
        : "min-h-11 px-4 text-base";
  return (
    <button
      type="button"
      className={`no-select inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${styles[variant]} ${sizeCls} ${className}`}
      {...rest}
    />
  );
}
