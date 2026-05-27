import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { BookCover } from "./BookCover";
import { Rating } from "./Rating";
import { ShelfActions } from "./ShelfActions";
import { cardMotion, fadeUp } from "../lib/motion";

export function BookCard({ book, onOpen, compact = false }) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      {...cardMotion}
      onClick={() => onOpen(book)}
      className="group flex h-full cursor-pointer flex-col rounded-lg border border-white/80 bg-white/80 p-3 shadow-card outline-none transition-shadow hover:shadow-lift focus-visible:ring-2 focus-visible:ring-iris/35"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(book);
      }}
    >
      <div className="grid grid-cols-[92px_1fr] gap-4">
        <div
          className={
            compact
              ? "aspect-[2/3] w-[82px]"
              : "aspect-[2/3] w-[92px] sm:w-[104px]"
          }
        >
          <BookCover book={book} />
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Rating rating={book.rating} count={book.ratingsCount} />
            {book.hasFullText ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-moss/20 bg-moss/10 px-2.5 py-1 text-xs font-semibold text-moss">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Читать
              </span>
            ) : null}
            {book.category ? (
              <span className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-xs font-medium text-graphite">
                {book.category}
              </span>
            ) : null}
          </div>

          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tightish text-ink">
            {book.title}
          </h3>
          {book.authors?.length ? (
            <p className="mt-1 line-clamp-1 text-sm text-graphite">
              {book.authors.join(", ")}
            </p>
          ) : null}

          {!compact && book.shortDescription ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-graphite">
              {book.shortDescription}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <ShelfActions book={book} compact />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-xs font-semibold text-graphite">
        <span>{book.publishedDate || "Дата не указана"}</span>
        <span className="inline-flex items-center gap-1 text-ink transition-transform group-hover:translate-x-0.5">
          Подробнее
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </motion.article>
  );
}
