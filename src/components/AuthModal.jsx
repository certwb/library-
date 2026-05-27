import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LogIn, LogOut, Mail, ShieldCheck, User, X } from "lucide-react";
import { buttonTap, modalOverlay, modalPanel } from "../lib/motion";
import { useUserStore } from "../store/userStore";

const genreOptions = [
  "Fantasy",
  "Science fiction",
  "Mystery",
  "Romance",
  "History",
  "Business",
  "Psychology",
  "Classics",
];

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white/85 px-3 text-sm font-medium text-ink outline-none transition focus:border-iris/50 focus:ring-4 focus:ring-iris/10";

export function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [selectedGenres, setSelectedGenres] = useState(["Fantasy", "Mystery"]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    readingGoal: "24",
    bio: "",
  });
  const users = useUserStore((state) => state.users);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const register = useUserStore((state) => state.register);
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);
  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) || null,
    [users, currentUserId]
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((current) =>
      current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre]
    );
  };

  const submit = (event) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "register") {
        if (form.name.trim().length < 2) {
          throw new Error("Введите имя минимум из 2 символов");
        }
        if (form.password.length < 6) {
          throw new Error("Пароль должен быть минимум 6 символов");
        }

        register({
          name: form.name,
          email: form.email,
          password: form.password,
          genres: selectedGenres,
          readingGoal: Number(form.readingGoal) || 0,
          bio: form.bio,
        });
      } else {
        login({ email: form.email, password: form.password });
      }

      onClose();
    } catch (authError) {
      setError(authError.message || "Не удалось выполнить действие");
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          {...modalOverlay}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/30 px-3 py-3 backdrop-blur-md sm:items-center sm:px-6"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-white/80 bg-porcelain p-4 shadow-lift sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                  Аккаунт NextRead
                </p>
                <h2
                  id="auth-title"
                  className="mt-2 text-3xl font-semibold tracking-tightish text-ink"
                >
                  {currentUser ? "Профиль читателя" : "Вход и регистрация"}
                </h2>
              </div>
              <motion.button
                type="button"
                {...buttonTap}
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:bg-line/50"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </motion.button>
            </div>

            {currentUser ? (
              <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
                <div className="rounded-lg border border-line bg-white/78 p-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
                    <User className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tightish text-ink">
                    {currentUser.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-graphite">
                    {currentUser.email}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-graphite">
                    {currentUser.bio || "Описание профиля пока пустое."}
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-white/78 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-porcelain p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                        Цель
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-ink">
                        {currentUser.readingGoal || 0} книг
                      </p>
                    </div>
                    <div className="rounded-lg bg-porcelain p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                        Жанры
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-ink">
                        {currentUser.genres?.join(", ") || "Не выбраны"}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    {...buttonTap}
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-coral/25 bg-coral/10 px-4 text-sm font-semibold text-coral transition hover:bg-coral/15"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Выйти из аккаунта
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-2 rounded-lg border border-line bg-white/70 p-1">
                  {[
                    { id: "login", label: "Войти", icon: LogIn },
                    { id: "register", label: "Регистрация", icon: ShieldCheck },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = mode === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        {...buttonTap}
                        onClick={() => {
                          setMode(item.id);
                          setError("");
                        }}
                        className={`relative inline-flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${
                          isActive ? "text-white" : "text-graphite hover:text-ink"
                        }`}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="auth-mode"
                            className="absolute inset-0 rounded-lg bg-ink"
                          />
                        ) : null}
                        <Icon className="relative h-4 w-4" aria-hidden="true" />
                        <span className="relative">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <form onSubmit={submit} className="space-y-4">
                  {mode === "register" ? (
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                        Имя
                      </span>
                      <input
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        className={inputClass}
                        placeholder="Например, Алина"
                      />
                    </label>
                  ) : null}

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                      Почта
                    </span>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite"
                        aria-hidden="true"
                      />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                      Пароль
                    </span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      className={inputClass}
                      placeholder="Минимум 6 символов"
                      required
                    />
                  </label>

                  {mode === "register" ? (
                    <>
                      <div>
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                          Любимые жанры
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {genreOptions.map((genre) => {
                            const isSelected = selectedGenres.includes(genre);

                            return (
                              <button
                                key={genre}
                                type="button"
                                onClick={() => toggleGenre(genre)}
                                className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition ${
                                  isSelected
                                    ? "border-iris bg-iris text-white"
                                    : "border-line bg-white text-graphite hover:text-ink"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : null}
                                {genre}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                            Цель в год
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={form.readingGoal}
                            onChange={(event) =>
                              updateField("readingGoal", event.target.value)
                            }
                            className={inputClass}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
                            О себе
                          </span>
                          <input
                            value={form.bio}
                            onChange={(event) => updateField("bio", event.target.value)}
                            className={inputClass}
                            placeholder="Что любишь читать и искать"
                          />
                        </label>
                      </div>
                    </>
                  ) : null}

                  {error ? (
                    <div className="rounded-lg border border-coral/20 bg-coral/10 p-3 text-sm font-semibold text-coral">
                      {error}
                    </div>
                  ) : null}

                  <motion.button
                    type="submit"
                    {...buttonTap}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-graphite"
                  >
                    {mode === "register" ? "Создать аккаунт" : "Войти"}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
