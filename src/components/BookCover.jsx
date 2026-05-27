import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

export function BookCover({ book, className = "" }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [book.thumbnail]);

  if (book.thumbnail && !hasError) {
    return (
      <img
        src={book.thumbnail}
        alt={`Обложка книги ${book.title}`}
        className={`h-full w-full rounded-lg object-cover book-cover-shadow ${className}`}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-lg border border-line bg-white text-graphite book-cover-shadow ${className}`}
      aria-label={`Обложка книги ${book.title} недоступна`}
    >
      <BookOpen className="h-9 w-9" aria-hidden="true" />
    </div>
  );
}
