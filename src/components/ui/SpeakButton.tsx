"use client";

import { speak } from "@/lib/speech";

interface Props {
  text: string;
  lang?: string;
  className?: string;
  size?: "sm" | "md";
}

export function SpeakButton({ text, lang, className = "", size = "md" }: Props) {
  return (
    <button
      type="button"
      aria-label="Ascolta"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, lang);
      }}
      className={`flex items-center justify-center rounded-full bg-white shadow-md active:scale-90 ${
        size === "sm" ? "h-10 w-10 text-xl" : "h-14 w-14 text-3xl"
      } ${className}`}
    >
      🔊
    </button>
  );
}
