export const shareBook = async (book) => {
  const url =
    book.openLibraryUrl ||
    book.canonicalVolumeLink ||
    book.previewLink ||
    book.infoLink ||
    window.location.href;
  const text = book.authors?.length
    ? `${book.title} - ${book.authors.join(", ")}`
    : book.title;

  if (navigator.share) {
    await navigator.share({
      title: book.title,
      text,
      url,
    });

    return "shared";
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  return "unsupported";
};
