import { Star } from "lucide-react";

export function Rating({ rating, count, className = "" }) {
  if (!rating) {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-line bg-white/70 px-2.5 py-1 text-xs font-medium text-graphite ${className}`}
      >
        Нет оценок
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-honey/30 bg-honey/10 px-2.5 py-1 text-xs font-semibold text-ink ${className}`}
    >
      <Star className="h-3.5 w-3.5 fill-honey text-honey" aria-hidden="true" />
      {rating.toFixed(1)}
      {count ? <span className="font-medium text-graphite">({count})</span> : null}
    </span>
  );
}
