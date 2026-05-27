import { randomTopics } from "../data/randomTopics";

const OPEN_LIBRARY_ORIGIN = "https://openlibrary.org";
const COVERS_ORIGIN = "https://covers.openlibrary.org";

const SEARCH_FIELDS = [
  "key",
  "title",
  "subtitle",
  "author_name",
  "author_key",
  "first_publish_year",
  "cover_i",
  "subject",
  "ratings_average",
  "ratings_count",
  "number_of_pages_median",
  "first_sentence",
  "edition_count",
  "ia",
  "has_fulltext",
  "ebook_access",
].join(",");

const noiseSubjects = new Set([
  "accessible book",
  "protected daisy",
  "in library",
  "overdrive",
  "internet archive wishlist",
  "large type books",
  "juvenile literature",
  "juvenile fiction",
]);

const normalizeArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const toWorkKey = (key) => {
  if (!key) return "";
  return key.startsWith("/") ? key : `/works/${key}`;
};

const getWorkId = (key) => toWorkKey(key).split("/").filter(Boolean).pop() || key;

const getCoverById = (coverId, size = "L") =>
  coverId ? `${COVERS_ORIGIN}/b/id/${coverId}-${size}.jpg?default=false` : "";

const cleanText = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getFirstSentence = (value) => cleanText(normalizeArray(value)[0] || "");

const pickBestCategory = (subjects = []) => {
  const subject = normalizeArray(subjects).find((item) => {
    const normalized = String(item).toLowerCase();
    return item && !noiseSubjects.has(normalized) && normalized.length < 42;
  });

  return subject || normalizeArray(subjects)[0] || "";
};

const toSubjectSlug = (subject) =>
  String(subject || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

const createDescription = ({ title, authors, category, year, sentence }) => {
  if (sentence) return sentence;

  const byline = authors?.length ? ` автора ${authors.join(", ")}` : "";
  const categoryText = category ? ` в теме "${category}"` : "";
  const yearText = year ? `, впервые опубликованная в ${year}` : "";

  return `${title} - книга${byline}${categoryText}${yearText}.`;
};

const normalizeBook = (doc, fallbackCategory = "") => {
  const workKey = toWorkKey(doc.key);
  const workId = getWorkId(workKey);
  const authors = normalizeArray(doc.author_name);
  const subjects = normalizeArray(doc.subject);
  const category = pickBestCategory(subjects) || fallbackCategory;
  const firstSentence = getFirstSentence(doc.first_sentence);
  const publishedDate = doc.first_publish_year ? String(doc.first_publish_year) : "";
  const openLibraryUrl = `${OPEN_LIBRARY_ORIGIN}${workKey}`;
  const description = createDescription({
    title: doc.title || "Без названия",
    authors,
    category,
    year: publishedDate,
    sentence: firstSentence,
  });
  const archiveId = normalizeArray(doc.ia)[0] || "";
  const rating = Number(doc.ratings_average);
  const ratingsCount = Number(doc.ratings_count);

  return {
    id: workId,
    key: workKey,
    source: "openlibrary",
    title: doc.title || "Без названия",
    subtitle: doc.subtitle || "",
    authors,
    authorKeys: normalizeArray(doc.author_key),
    publisher: "",
    publishedDate,
    description,
    shortDescription:
      description.length > 190 ? `${description.slice(0, 190).trim()}...` : description,
    categories: subjects.slice(0, 12),
    category,
    thumbnail: getCoverById(doc.cover_i || doc.cover_id),
    pageCount: doc.number_of_pages_median || null,
    rating: Number.isFinite(rating) ? rating : null,
    ratingsCount: Number.isFinite(ratingsCount) ? ratingsCount : 0,
    editionCount: doc.edition_count || 0,
    archiveId,
    hasFullText: Boolean(doc.has_fulltext || archiveId),
    readLink: archiveId ? `https://archive.org/details/${archiveId}` : "",
    readerEmbedUrl: archiveId ? `https://archive.org/embed/${archiveId}` : "",
    ebookAccess: doc.ebook_access || "",
    openLibraryUrl,
    previewLink: openLibraryUrl,
    infoLink: openLibraryUrl,
    canonicalVolumeLink: openLibraryUrl,
  };
};

const normalizeSubjectWork = (work, subject) => {
  const authors = normalizeArray(work.authors).map((author) => author.name).filter(Boolean);
  const doc = {
    key: work.key,
    title: work.title,
    author_name: authors,
    first_publish_year: work.first_publish_year,
    cover_i: work.cover_id,
    subject: [subject],
    edition_count: work.edition_count,
    ia: work.ia,
    has_fulltext: work.has_fulltext,
    ebook_access: work.ebook_access,
  };

  return normalizeBook(doc, subject);
};

const requestJson = async (path, params = new URLSearchParams()) => {
  const url = new URL(path, OPEN_LIBRARY_ORIGIN);
  params.forEach((value, key) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Open Library временно недоступна");
  }

  return response.json();
};

const uniqueBooks = (books) => {
  const seen = new Set();

  return books.filter((book) => {
    if (!book?.id || seen.has(book.id)) return false;
    seen.add(book.id);
    return true;
  });
};

export const searchBooks = async (
  query,
  { maxResults = 60, startIndex = 0, sort = "" } = {}
) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) return [];

  const params = new URLSearchParams({
    q: normalizedQuery,
    limit: String(maxResults),
    offset: String(startIndex),
    fields: SEARCH_FIELDS,
  });

  if (sort) {
    params.set("sort", sort);
  }

  const data = await requestJson("/search.json", params);

  return uniqueBooks((data.docs || []).map((doc) => normalizeBook(doc)));
};

export const getSubjectBooks = async (
  subject,
  { limit = 24, offset = 0 } = {}
) => {
  const slug = toSubjectSlug(subject);

  if (!slug) return [];

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const data = await requestJson(`/subjects/${slug}.json`, params);
  const subjectName = data.name || subject;

  return uniqueBooks(
    (data.works || []).map((work) => normalizeSubjectWork(work, subjectName))
  );
};

export const getRecommendations = async (book, { maxResults = 24 } = {}) => {
  const category = book?.category || book?.categories?.[0] || "";
  const author = book?.authors?.[0] || "";
  const candidates = [];

  if (category) {
    try {
      candidates.push(...(await getSubjectBooks(category, { limit: maxResults + 4 })));
    } catch {
      candidates.push(...(await searchBooks(`subject:${category}`, { maxResults })));
    }
  }

  if (candidates.length < maxResults && author) {
    candidates.push(...(await searchBooks(author, { maxResults })));
  }

  if (candidates.length < maxResults && book?.title) {
    candidates.push(...(await searchBooks(book.title, { maxResults })));
  }

  return uniqueBooks(candidates)
    .filter((item) => item.id !== book.id)
    .slice(0, maxResults);
};

export const getRandomBook = async () => {
  const topic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  const offset = Math.floor(Math.random() * 8) * 12;
  let candidates = [];

  try {
    candidates = await getSubjectBooks(topic, { limit: 60, offset });
  } catch {
    candidates = await searchBooks(topic, { maxResults: 60, startIndex: offset });
  }

  if (!candidates.length) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
};
