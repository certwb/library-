# NextRead

MVP веб-приложения для поиска книг, рекомендаций, полок, аккаунта и чтения доступных Open Library/Internet Archive книг прямо на сайте.

## Архитектура

- `src/App.jsx` - главный сценарий поиска, пагинации, модалок, аккаунта и читалки.
- `src/lib/openLibrary.js` - клиент Open Library API, рекомендации, случайная книга и нормализация данных.
- `src/lib/motion.js` - общие варианты Framer Motion.
- `src/lib/share.js` - Web Share API с fallback в Clipboard.
- `src/store/bookshelfStore.js` - Zustand store с `localStorage` для полок.
- `src/store/userStore.js` - demo-вход и регистрация через `localStorage`.
- `src/components/HeroSearch.jsx` - крупный поисковый блок и быстрые запросы.
- `src/components/BookCard.jsx` - карточка книги, рейтинги, полки и share.
- `src/components/BookModal.jsx` - детальная карточка книги и кнопка чтения.
- `src/components/ReaderModal.jsx` - встроенная читалка Internet Archive.
- `src/components/RecommendationCarousel.jsx` - похожие книги с рабочими стрелками.
- `src/components/Bookshelf.jsx` - полки "Хочу прочитать" и "Прочитано".
- `src/components/AuthModal.jsx` - вход, регистрация и профиль читателя.
- `src/components/SkeletonBookCard.jsx` - skeleton loading вместо спиннеров.

## Запуск

```bash
npm install
npm run dev
```
