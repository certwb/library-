import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ExternalLink, X, ShoppingCart } from "lucide-react";
import { BookCover } from "./BookCover";
import { Rating } from "./Rating";
import { RecommendationCarousel } from "./RecommendationCarousel";
import { ShelfActions } from "./ShelfActions";
import { buttonTap, modalOverlay, modalPanel } from "../lib/motion";

export function BookModal({ book, onClose, onSelectBook, onRead }) {
  return (
    <AnimatePresence>
      {book ? (
        <motion.div
          {...modalOverlay}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/28 px-3 py-3 backdrop-blur-md sm:items-center sm:px-6"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto overflow-x-hidden rounded-lg border border-white/80 bg-porcelain p-4 shadow-lift sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-modal-title"
          >
            <div className="mb-4 flex justify-end">
              <motion.button
                type="button"
                {...buttonTap}
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-iris/30"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <div className="mx-auto w-full max-w-[230px] lg:max-w-none">
                <div className="aspect-[2/3] w-full">
                  <BookCover book={book} />
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Rating rating={book.rating} count={book.ratingsCount} />
                  {book.category ? (
                    <span className="rounded-full border border-line bg-white/75 px-3 py-1 text-xs font-semibold text-graphite">
                      {book.category}
                    </span>
                  ) : null}
                  {book.pageCount ? (
                    <span className="rounded-full border border-line bg-white/75 px-3 py-1 text-xs font-semibold text-graphite">
                      {book.pageCount} стр.
                    </span>
                  ) : null}
                  {book.editionCount ? (
                    <span className="rounded-full border border-line bg-white/75 px-3 py-1 text-xs font-semibold text-graphite">
                      {book.editionCount} изд.
                    </span>
                  ) : null}
                </div>

                <h2
                  id="book-modal-title"
                  className="text-3xl font-semibold tracking-tightish text-ink sm:text-5xl"
                >
                  {book.title}
                </h2>
                {book.subtitle ? (
                  <p className="mt-2 text-lg font-medium text-graphite">{book.subtitle}</p>
                ) : null}
                {book.authors?.length ? (
                  <p className="mt-4 text-base font-semibold text-ink">
                    {book.authors.join(", ")}
                  </p>
                ) : null}

                {book.description ? (
                  <p className="mt-6 max-w-3xl text-base leading-8 text-graphite">
                    {book.description}
                  </p>
                ) : (
                  <p className="mt-6 max-w-3xl text-base leading-8 text-graphite">
                    Описание недоступно, но рекомендации можно построить по
                    категории, автору и похожим изданиям Open Library.
                  </p>
                )}

                <div className="mt-7">
                  <ShelfActions book={book} />
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  {book.readerEmbedUrl ? (
                    <motion.button
                      type="button"
                      {...buttonTap}
                      onClick={() => onRead(book)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-graphite focus:outline-none focus:ring-2 focus:ring-iris/30"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      Читать на сайте
                    </motion.button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-line bg-white/65 px-4 py-2 text-sm font-semibold text-graphite"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      Онлайн-чтение недоступно
                    </button>
                  )}

                  {book.previewLink ? (
                    <motion.a
                      {...buttonTap}
                      href={book.previewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-iris/30 hover:bg-iris/10 focus:outline-none focus:ring-2 focus:ring-iris/30"
                    >
                      В Open Library
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </motion.a>
                  ) : null}

                  <motion.a
                    {...buttonTap}
                    href={`https://www.litres.ru/pages/rmd_search/?q=${encodeURIComponent(book.title + (book.authors?.length ? " " + book.authors[0] : ""))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-transparent bg-amber-500/10 text-amber-600 px-4 py-2 text-sm font-semibold transition hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    Купить книгу
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  </motion.a>
                </div>
              </div>
            </div>

            <RecommendationCarousel book={book} onSelect={onSelectBook} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
