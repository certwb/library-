import { BookOpenCheck } from "lucide-react";

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
        <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-graphite">
          {description}
        </p>
      ) : null}
    </div>
  );
}
