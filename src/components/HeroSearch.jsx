import { useState } from "react";
import { motion } from "framer-motion";
import { Dice5, Search, Sparkles, MapPin } from "lucide-react";
import { starterQueries } from "../data/randomTopics";
import { buttonTap, fadeUp, staggerContainer } from "../lib/motion";

export function HeroSearch({
  initialQuery = "",
  isLoading,
  isRandomLoading,
  onSearch,
  onRandom,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [cisPopular, setCisPopular] = useState(false);
  const [cisPublished, setCisPublished] = useState(false);

  const submitSearch = (event) => {
    if (event) event.preventDefault();
    let finalQuery = query;
    if (cisPopular) finalQuery += " subject:russian literature";
    if (cisPublished) finalQuery += " subject:kazakhstan";
    onSearch(finalQuery || "russian literature");
  };

  const handleCisPopularToggle = () => {
    const nextState = !cisPopular;
    setCisPopular(nextState);
    if (nextState) {
      onSearch(query ? `${query} subject:russian literature` : "subject:russian literature");
    }
  };

  const handleCisPublishedToggle = () => {
    const nextState = !cisPublished;
    setCisPublished(nextState);
    if (nextState) {
      onSearch(query ? `${query} subject:kazakhstan` : "subject:kazakhstan");
    }
  };

  const runStarter = (value) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl pt-28 sm:pt-36"
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/75 px-3 py-1.5 text-sm font-semibold text-graphite shadow-sm">
          <Sparkles className="h-4 w-4 text-iris" aria-hidden="true" />
          Подборки на базе Open Library
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tightish text-ink sm:text-6xl">
          Что будем читать сегодня?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-graphite sm:text-lg">
          Найдите книгу, откройте карточку, а умная библиотека подберет похожие истории по жанру, автору и настроению.
        </p>
      </motion.div>

      <motion.form
        variants={fadeUp}
        onSubmit={submitSearch}
        className="glass-panel mx-auto mt-10 max-w-4xl rounded-lg p-2"
      >
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Поиск книги</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-graphite"
              aria-hidden="true"
            />
            <input
              id="hero-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Введите название, автора или жанр"
              className="h-14 w-full rounded-lg border border-line bg-white/85 pl-12 pr-4 text-base font-medium text-ink outline-none transition focus:border-iris/50 focus:ring-4 focus:ring-iris/10"
            />
          </label>

          <motion.button
            type="submit"
            {...buttonTap}
            disabled={isLoading}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Ищу..." : "Найти"}
          </motion.button>

          <motion.button
            type="button"
            {...buttonTap}
            disabled={isRandomLoading}
            onClick={onRandom}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-line bg-white/85 px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-iris/30 hover:bg-iris/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Dice5 className="h-4 w-4" aria-hidden="true" />
            {isRandomLoading ? "Выбираю..." : "Случайная"}
          </motion.button>
          
          <div className="col-span-full mt-2 flex flex-wrap items-center gap-3 px-1 pb-1">
            <button
              type="button"
              onClick={() => {
                setCisPopular(false);
                setCisPublished(false);
                onSearch("bestseller");
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                !cisPopular && !cisPublished
                  ? "border-iris bg-iris/10 text-iris"
                  : "border-line bg-white/50 text-graphite hover:bg-white"
              }`}
            >
              Все книги
            </button>
            <button
              type="button"
              onClick={handleCisPopularToggle}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                cisPopular
                  ? "border-iris bg-iris/10 text-iris"
                  : "border-line bg-white/50 text-graphite hover:bg-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Популярное в СНГ
            </button>
            <button
              type="button"
              onClick={handleCisPublishedToggle}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                cisPublished
                  ? "border-iris bg-iris/10 text-iris"
                  : "border-line bg-white/50 text-graphite hover:bg-white"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" /> Издано в СНГ
            </button>
          </div>
        </div>
      </motion.form>

      <motion.div
        variants={fadeUp}
        className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-2"
      >
        {starterQueries.map((value) => (
          <motion.button
            key={value}
            type="button"
            {...buttonTap}
            onClick={() => runStarter(value)}
            className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-sm font-semibold text-graphite shadow-sm transition hover:border-iris/30 hover:text-ink"
          >
            {value}
          </motion.button>
        ))}
      </motion.div>
    </motion.section>
  );
}
