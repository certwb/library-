import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getRecommendations } from "../lib/openLibrary";
import { buttonTap, fadeUp } from "../lib/motion";
import { BookCard } from "./BookCard";

function RecommendationSkeleton() {
  return (
    <div className="min-w-[320px] rounded-lg border border-white/80 bg-white/75 p-3 shadow-card">
      <div className="aspect-[2/3] w-24 animate-pulse rounded-lg bg-line" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-line" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-line" />
      </div>
    </div>
  );
}

export function RecommendationCarousel({ book, onSelect }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const railRef = useRef(null);

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.min(rail.clientWidth * 0.9, 760),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError("");
    setItems([]);

    getRecommendations(book)
      .then((books) => {
        if (isActive) setItems(books);
      })
      .catch(() => {
        if (isActive) setError("Не удалось загрузить похожие книги");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [book]);

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="mt-10 min-w-0 overflow-hidden"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-graphite">
            <Sparkles className="h-3.5 w-3.5 text-iris" aria-hidden="true" />
            Похожие книги
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tightish text-ink">
            Если понравилась эта книга
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            {...buttonTap}
            onClick={() => scrollRail(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink shadow-sm transition hover:border-iris/30 hover:bg-iris/10"
            aria-label="Листать рекомендации назад"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </motion.button>
          <motion.button
            type="button"
            {...buttonTap}
            onClick={() => scrollRail(1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink shadow-sm transition hover:border-iris/30 hover:bg-iris/10"
            aria-label="Листать рекомендации вперед"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      {isLoading ? (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <RecommendationSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-line bg-white/75 p-5 text-sm font-medium text-graphite">
          {error}
        </div>
      ) : items.length ? (
        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-[320px] max-w-[320px] snap-start sm:min-w-[340px] sm:max-w-[340px]"
            >
              <BookCard book={item} onOpen={onSelect} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-white/75 p-5 text-sm font-medium text-graphite">
          Для этой книги пока не нашлось уверенных совпадений.
        </div>
      )}
    </motion.section>
  );
}
