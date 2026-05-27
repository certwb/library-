import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Plus } from "lucide-react";
import { AuthModal } from "./components/AuthModal";
import { BookModal } from "./components/BookModal";
import { BookCard } from "./components/BookCard";
import { Bookshelf } from "./components/Bookshelf";
import { EmptyState } from "./components/EmptyState";
import { Header } from "./components/Header";
import { HeroSearch } from "./components/HeroSearch";
import { ReaderModal } from "./components/ReaderModal";
import { SkeletonGrid } from "./components/SkeletonBookCard";
import { AIChatWidget } from "./components/AIChatWidget";
import { UserProfile } from "./components/UserProfile";
import { Footer } from "./components/Footer";
import { SupportView } from "./components/SupportView";
import { getRandomBook, searchBooks } from "./lib/openLibrary";
import { buttonTap, fadeUp, pageTransition, staggerContainer } from "./lib/motion";
import { useBookshelfStore } from "./store/bookshelfStore";
import { useUserStore } from "./store/userStore";

const PAGE_SIZE = 60;

const mergeBooks = (currentBooks, nextBooks) => {
  const seen = new Set(currentBooks.map((book) => book.id));
  return [
    ...currentBooks,
    ...nextBooks.filter((book) => {
      if (seen.has(book.id)) return false;
      seen.add(book.id);
      return true;
    }),
  ];
};

export default function App() {
  const [sortBy, setSortBy] = useState("relevance");
  const [activeView, setActiveView] = useState("search");
  const [books, setBooks] = useState([]);
  const [activeQuery, setActiveQuery] = useState("");
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingBook, setReadingBook] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const wantToReadCount = useBookshelfStore((state) => state.wantToRead.length);
  const readCount = useBookshelfStore((state) => state.read.length);
  const users = useUserStore((state) => state.users);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const logout = useUserStore((state) => state.logout);
  const shelfCount = wantToReadCount + readCount;
  
  const sortedBooks = useMemo(() => {
    const copy = [...books];
    if (sortBy === "rating") {
      copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "reviews") {
      copy.sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0));
    }
    return copy;
  }, [books, sortBy]);

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) || null,
    [users, currentUserId]
  );

  const searchTitle = useMemo(() => {
    if (!activeQuery) return "Результаты поиска";
    return `Результаты по запросу "${activeQuery}"`;
  }, [activeQuery]);

  const navigate = (view) => {
    const isAlreadySearch = activeView === "search" && view === "search";
    setActiveView(view);
    setSelectedBook(null);
    setReadingBook(null);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (isAlreadySearch || view === "search") {
        setTimeout(() => {
          const input = document.getElementById("hero-search-input");
          if (input) input.focus();
        }, 100);
      }
    });
  };

  const runSearch = async (query) => {
    const nextQuery = query.trim();

    if (!nextQuery) return;

    setActiveView("search");
    setSelectedBook(null);
    setReadingBook(null);
    setActiveQuery(nextQuery);
    setLastSearchQuery(nextQuery);
    setIsLoading(true);
    setError("");
    setHasMore(false);
    setNextOffset(0);

    try {
      const results = await searchBooks(nextQuery, { maxResults: PAGE_SIZE });
      setBooks(results);
      setNextOffset(PAGE_SIZE);
      setHasMore(results.length >= PAGE_SIZE);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch (requestError) {
      setError(requestError.message || "Не удалось найти книги");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreBooks = async () => {
    if (!lastSearchQuery || isLoadingMore) return;

    setIsLoadingMore(true);
    setError("");

    try {
      const results = await searchBooks(lastSearchQuery, {
        maxResults: PAGE_SIZE,
        startIndex: nextOffset,
      });
      setBooks((current) => mergeBooks(current, results));
      setNextOffset((current) => current + PAGE_SIZE);
      setHasMore(results.length >= PAGE_SIZE);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить еще книги");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const runRandom = async () => {
    setActiveView("search");
    setIsRandomLoading(true);
    setError("");

    try {
      const book = await getRandomBook();

      if (!book) {
        setError("Случайная книга не нашлась. Попробуй еще раз.");
        return;
      }

      setActiveQuery("Случайная находка");
      setLastSearchQuery(book.category || book.title);
      setHasMore(false);
      setBooks((currentBooks) => [
        book,
        ...currentBooks.filter((item) => item.id !== book.id),
      ]);
      setSelectedBook(book);
    } catch (requestError) {
      setError(requestError.message || "Не удалось выбрать случайную книгу");
    } finally {
      setIsRandomLoading(false);
    }
  };

  useEffect(() => {
    runSearch("bestseller");
  }, []);

  useEffect(() => {
    const handleRequireAuth = () => setIsAuthOpen(true);
    window.addEventListener("require-auth", handleRequireAuth);
    return () => window.removeEventListener("require-auth", handleRequireAuth);
  }, []);

  return (
    <div className="min-h-screen text-ink">
      <Header
        activeView={activeView}
        onViewChange={navigate}
        shelfCount={shelfCount}
        currentUser={currentUser}
        onAuthOpen={() => setIsAuthOpen(true)}
        onLogout={logout}
        onGlobalSearch={(query) => {
          runSearch(query);
          navigate("search");
        }}
      />

      <AnimatePresence mode="wait">
        {activeView === "shelves" ? (
          <motion.main key="shelves" {...pageTransition} className="pt-24 pb-20">
            <Bookshelf onOpen={setSelectedBook} />
          </motion.main>
        ) : activeView === "profile" ? (
          <motion.main key="profile" {...pageTransition} className="pt-24 pb-20">
            <UserProfile onLogout={() => {
              logout();
              navigate("search");
            }} />
          </motion.main>
        ) : activeView === "support" ? (
          <motion.main key="support" {...pageTransition} className="pt-24 pb-20">
            <SupportView />
          </motion.main>
        ) : (
          <motion.main key="search" {...pageTransition} className="px-4 pb-20">
            <HeroSearch
              initialQuery=""
              isLoading={isLoading}
              isRandomLoading={isRandomLoading}
              onSearch={runSearch}
              onRandom={runRandom}
            />

            <section className="mx-auto mt-16 max-w-6xl">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
                    Подборка
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tightish text-ink">
                    {searchTitle}
                  </h2>
                </div>
                
                <div className="flex flex-col gap-2 sm:items-end">
                  <p className="max-w-xl text-sm leading-6 text-graphite text-right">
                    Сейчас показываем до {PAGE_SIZE} книг за один запрос и
                    подгружаем следующие страницы Open Library по кнопке ниже.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium text-graphite">Сортировка:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-sm font-medium text-ink focus:border-iris focus:outline-none focus:ring-1 focus:ring-iris transition-colors"
                    >
                      <option value="relevance">По релевантности</option>
                      <option value="rating">По рейтингу</option>
                      <option value="reviews">По отзывам</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {isLoading ? (
                <SkeletonGrid count={12} />
              ) : error ? (
                <div className="rounded-lg border border-coral/20 bg-coral/10 p-5 text-sm font-semibold text-coral">
                  <AlertCircle className="mr-2 inline h-4 w-4" aria-hidden="true" />
                  {error}
                </div>
              ) : books.length ? (
                <>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {sortedBooks.map((book) => (
                      <BookCard key={book.id} book={book} onOpen={setSelectedBook} />
                    ))}
                  </motion.div>

                  {hasMore ? (
                    <div className="mt-8 flex justify-center">
                      <motion.button
                        type="button"
                        {...buttonTap}
                        onClick={loadMoreBooks}
                        disabled={isLoadingMore}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-sm font-semibold text-ink shadow-card transition hover:border-iris/30 hover:bg-iris/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {isLoadingMore ? "Загружаю..." : "Загрузить еще книги"}
                      </motion.button>
                    </div>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  title="Ничего не найдено"
                  description="Попробуй другое название, автора или жанр. Лучше всего работают конкретные книги и категории."
                />
              )}
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      <Footer onViewChange={navigate} onRandom={runRandom} />

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onSelectBook={setSelectedBook}
        onRead={(book) => setReadingBook(book)}
      />
      <ReaderModal book={readingBook} onClose={() => setReadingBook(null)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      <AIChatWidget onOpenBook={setSelectedBook} />
    </div>
  );
}
