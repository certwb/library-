import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { buttonTap, modalOverlay, modalPanel } from "../lib/motion";

export function ReaderModal({ book, onClose }) {
  return (
    <AnimatePresence>
      {book ? (
        <motion.div
          {...modalOverlay}
          className="fixed inset-0 z-[70] bg-ink/34 p-3 backdrop-blur-md sm:p-5"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            onClick={(event) => event.stopPropagation()}
            className="mx-auto flex h-[94vh] max-w-7xl flex-col overflow-hidden rounded-lg border border-white/80 bg-porcelain shadow-lift"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-title"
          >
            <div className="flex items-center justify-between gap-4 border-b border-line bg-white/80 px-4 py-3 backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                  Чтение на сайте
                </p>
                <h2
                  id="reader-title"
                  className="truncate text-lg font-semibold tracking-tightish text-ink"
                >
                  {book.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {book.readLink ? (
                  <motion.a
                    {...buttonTap}
                    href={book.readLink}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-iris/30 hover:bg-iris/10 sm:inline-flex"
                  >
                    Открыть источник
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </motion.a>
                ) : null}
                <motion.button
                  type="button"
                  {...buttonTap}
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-iris/30"
                  aria-label="Закрыть читалку"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>
            </div>

            {book.readerEmbedUrl ? (
              <iframe
                title={`Читалка ${book.title}`}
                src={book.readerEmbedUrl}
                className="h-full w-full flex-1 bg-white"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div className="max-w-md">
                  <h3 className="text-2xl font-semibold tracking-tightish text-ink">
                    Онлайн-чтение недоступно
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-graphite">
                    У этой книги нет публичного читабельного архива в Open Library.
                    Можно открыть карточку источника и проверить доступные издания.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
