import { create } from "zustand";
import { persist } from "zustand/middleware";

const normalizeEmail = (email) => email.trim().toLowerCase();

const encodePassword = (password) => {
  try {
    return btoa(unescape(encodeURIComponent(password)));
  } catch {
    return password;
  }
};

const createUserId = () =>
  `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      register: ({ name, email, password, genres, readingGoal, bio }) => {
        const normalizedEmail = normalizeEmail(email);
        const state = get();

        if (state.users.some((user) => user.email === normalizedEmail)) {
          throw new Error("Пользователь с такой почтой уже существует");
        }

        const user = {
          id: createUserId(),
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: encodePassword(password),
          genres,
          readingGoal,
          bio: bio.trim(),
          createdAt: new Date().toISOString(),
        };

        set((currentState) => ({
          users: [...currentState.users, user],
          currentUserId: user.id,
        }));

        return user;
      },
      login: ({ email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const passwordHash = encodePassword(password);
        const user = get().users.find(
          (item) => item.email === normalizedEmail && item.passwordHash === passwordHash
        );

        if (!user) {
          throw new Error("Неверная почта или пароль");
        }

        set({ currentUserId: user.id });
        return user;
      },
      logout: () => set({ currentUserId: null }),
      updateProfile: (patch) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === state.currentUserId ? { ...user, ...patch } : user
          ),
        })),
    }),
    {
      name: "nextread-user-account",
      version: 1,
    }
  )
);
