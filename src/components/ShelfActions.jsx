import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Check, Share2 } from "lucide-react";
import { buttonTap } from "../lib/motion";
import { shareBook } from "../lib/share";
import { useBookshelfStore } from "../store/bookshelfStore";
import { useUserStore } from "../store/userStore";

const baseButton =
  "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-iris/30";

export function ShelfActions({ book, compact = false }) {
  const [shareState, setShareState] = useState("");
  const toggleShelf = useBookshelfStore((state) => state.toggleShelf);
  const isWantToRead = useBookshelfStore((state) =>
    state.wantToRead.some((item) => item.id === book.id)
  );
  const isRead = useBookshelfStore((state) =>
    state.read.some((item) => item.id === book.id)
  );
  const currentUserId = useUserStore(state => state.currentUserId);

  const handleShelf = (event, shelf) => {
    event.stopPropagation();
    if (!currentUserId) {
      window.dispatchEvent(new CustomEvent('require-auth'));
      return;
    }
    toggleShelf(book, shelf);
  };

  const handleShare = async (event) => {
    event.stopPropagation();

    try {
      const result = await shareBook(book);
      setShareState(result === "copied" ? "Ссылка" : "Готово");
      window.setTimeout(() => setShareState(""), 1500);
    } catch (error) {
      if (error?.name !== "AbortError") {
        setShareState("Ошибка");
        window.setTimeout(() => setShareState(""), 1500);
      }
    }
  };

  return (
    <div
      className={
        compact
          ? "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2"
          : "flex flex-col gap-2 sm:flex-row"
      }
    >
      <motion.button
        type="button"
        {...buttonTap}
        onClick={(event) => handleShelf(event, "wantToRead")}
        className={`${baseButton} ${
          isWantToRead
            ? "border-moss bg-moss text-white"
            : "border-line bg-white/85 text-ink hover:border-moss/35 hover:bg-moss/10"
        } ${compact ? "px-2" : ""}`}
        aria-pressed={isWantToRead}
      >
        <Bookmark
          className={`h-4 w-4 shrink-0 ${isWantToRead ? "fill-white" : ""}`}
          aria-hidden="true"
        />
        <span className="min-w-0 text-center leading-tight">Хочу прочитать</span>
      </motion.button>

      <motion.button
        type="button"
        {...buttonTap}
        onClick={(event) => handleShelf(event, "read")}
        className={`${baseButton} ${
          isRead
            ? "border-iris bg-iris text-white"
            : "border-line bg-white/85 text-ink hover:border-iris/35 hover:bg-iris/10"
        } ${compact ? "px-2" : ""}`}
        aria-pressed={isRead}
      >
        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 text-center leading-tight">Прочитано</span>
      </motion.button>

      <motion.button
        type="button"
        {...buttonTap}
        onClick={handleShare}
        className={`${baseButton} border-line bg-white/85 text-ink hover:border-coral/35 hover:bg-coral/10 ${
          compact ? "px-2" : "sm:w-11 sm:px-0"
        }`}
        aria-label="Поделиться книгой"
        title="Поделиться"
      >
        {shareState ? (
          <span className="text-[10px]">{shareState}</span>
        ) : (
          <Share2 className="h-4 w-4" aria-hidden="true" />
        )}
      </motion.button>
    </div>
  );
}
