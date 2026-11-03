interface Props {
  value: number;
  max?: number;
  size?: "sm" | "lg";
}

export function Stars({ value, max = 3, size = "sm" }: Props) {
  return (
    <span className={`inline-flex gap-0.5 ${size === "lg" ? "text-5xl" : "text-lg"}`} aria-label={`${value} stelle su ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "" : "opacity-25"}>
          ⭐
        </span>
      ))}
    </span>
  );
}
