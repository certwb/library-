import { create } from "zustand";
import { persist } from "zustand/middleware";

const compactBook = (book) => ({
  id: book.id,
  title: book.title,
  subtitle: book.subtitle,
  authors: book.authors,
  category: book.category,
  categories: book.categories,
  thumbnail: book.thumbnail,
  rating: book.rating,
  ratingsCount: book.ratingsCount,
  publishedDate: book.publishedDate,
  pageCount: book.pageCount,
  editionCount: book.editionCount,
  archiveId: book.archiveId,
  readerEmbedUrl: book.readerEmbedUrl,
  hasFullText: book.hasFullText,
  ebookAccess: book.ebookAccess,
  description: book.description,
  shortDescription: book.shortDescription,
  openLibraryUrl: book.openLibraryUrl,
  readLink: book.readLink,
  canonicalVolumeLink: book.canonicalVolumeLink,
  previewLink: book.previewLink,
  infoLink: book.infoLink,
});

const upsert = (items, book) => {
  const nextBook = compactBook(book);
  const exists = items.some((item) => item.id === book.id);

  return exists
    ? items.map((item) => (item.id === book.id ? nextBook : item))
    : [nextBook, ...items];
};

export const useBookshelfStore = create(
  persist(
    (set, get) => ({
      wantToRead: [],
      read: [],
      addToShelf: (book, shelf) =>
        set((state) => {
          if (shelf === "read") {
            return {
              read: upsert(state.read, book),
              wantToRead: state.wantToRead.filter((item) => item.id !== book.id),
            };
          }

          return {
            wantToRead: upsert(state.wantToRead, book),
            read: state.read.filter((item) => item.id !== book.id),
          };
        }),
      removeFromShelf: (bookId, shelf) =>
        set((state) => ({
          [shelf]: state[shelf].filter((item) => item.id !== bookId),
        })),
      toggleShelf: (book, shelf) => {
        const state = get();
        const isActive = state[shelf].some((item) => item.id === book.id);

        if (isActive) {
          state.removeFromShelf(book.id, shelf);
        } else {
          state.addToShelf(book, shelf);
        }
      },
      getShelfStatus: (bookId) => {
        const state = get();

        return {
          wantToRead: state.wantToRead.some((item) => item.id === bookId),
          read: state.read.some((item) => item.id === bookId),
        };
      },
    }),
    {
      name: "nextread-bookshelves",
      version: 1,
    }
  )
);
