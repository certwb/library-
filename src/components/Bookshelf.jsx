import { motion } from "framer-motion";
import { Bookmark, Check } from "lucide-react";
import { BookCard } from "./BookCard";
import { EmptyState } from "./EmptyState";
import { fadeUp, staggerContainer } from "../lib/motion";
import { useBookshelfStore } from "../store/bookshelfStore";

function ShelfSection({ title, icon: Icon, books, onOpen }) {
  return (
    <motion.section variants={fadeUp} className="mt-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tightish text-ink">{title}</h2>
          <p className="text-sm font-medium text-graphite">{books.length} книг</p>
        </div>
      </div>

      {books.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onOpen={onOpen} compact />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Пока пусто"
          description="Добавь книги из поиска, и эта полка станет твоим коротким списком."
        />
      )}
    </motion.section>
  );
}

export function Bookshelf({ onOpen }) {
  const wantToRead = useBookshelfStore((state) => state.wantToRead);
  const read = useBookshelfStore((state) => state.read);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:pt-36"
    >
      <motion.div variants={fadeUp} className="max-w-3xl">
        <span className="rounded-full border border-line bg-white/75 px-3 py-1.5 text-sm font-semibold text-graphite">
          LocalStorage
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tightish text-ink sm:text-5xl">
          Твои книжные полки
        </h1>
        <p className="mt-4 text-base leading-7 text-graphite">
          Сохраняй находки в "Хочу прочитать" и переносить книги в "Прочитано"
          можно одним кликом.
        </p>
      </motion.div>

      <ShelfSection
        title="Хочу прочитать"
        icon={Bookmark}
        books={wantToRead}
        onOpen={onOpen}
      />
      <ShelfSection title="Прочитано" icon={Check} books={read} onOpen={onOpen} />
    </motion.div>
  );
}
