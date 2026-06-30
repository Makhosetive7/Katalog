const EXTERNAL_SHELF_MAP = {
  read: "Completed",
  "currently-reading": "In-Progress",
  "to-read": "Planned",
};

const normalizeHeader = (key) =>
  String(key)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const parseIntSafe = (value) => {
  const n = parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const parseRating = (value, scale = 5) => {
  const n = parseFloat(String(value).trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (scale === 5) return Math.min(n, 5);
  return Math.min(n, 10);
};

const parseDate = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export const detectImportFormat = (headers) => {
  const normalized = headers.map(normalizeHeader);
  if (normalized.includes("exclusive shelf") || normalized.includes("book id")) {
    return "external";
  }
  if (normalized.includes("completionpercentage") || normalized.includes("currentpage")) {
    return "katalog";
  }
  return "unknown";
};

const mapExternalRow = (row) => {
  const get = (...keys) => {
    for (const key of keys) {
      const match = Object.entries(row).find(([k]) => normalizeHeader(k) === normalizeHeader(key));
      if (match && String(match[1]).trim()) return String(match[1]).trim();
    }
    return "";
  };

  const exclusiveShelf = get("Exclusive Shelf").toLowerCase();
  const status = EXTERNAL_SHELF_MAP[exclusiveShelf] ?? "Planned";
  const pages = parseIntSafe(get("Number of Pages"));
  const rating = parseRating(get("My Rating"), 5);
  const review = get("My Review");
  const privateNotes = get("Private Notes");
  const notes = [review, privateNotes].filter(Boolean).join("\n\n") || undefined;
  const isbn = get("ISBN13", "ISBN") || undefined;
  const dateRead = parseDate(get("Date Read"));
  const dateAdded = parseDate(get("Date Added"));

  const timeline = {};
  if (status === "Completed" && dateRead) timeline.completedAt = dateRead;
  if (status === "In-Progress" && dateAdded) timeline.startedAt = dateAdded;
  if (status === "Completed" && dateAdded && !timeline.startedAt) {
    timeline.startedAt = dateAdded;
  }

  let completionPercentage = 0;
  let currentPage = 0;
  if (status === "Completed") {
    completionPercentage = 100;
    currentPage = pages ?? 0;
  }

  return {
    title: get("Title"),
    author: get("Author") || "Unknown",
    status,
    pages,
    chapters: undefined,
    currentPage,
    currentChapter: 0,
    completionPercentage,
    rating,
    notes,
    isbn,
    genre: [],
    imageUrl: undefined,
    timeline: Object.keys(timeline).length ? timeline : undefined,
    source: "external",
    externalId: get("Book Id") || undefined,
  };
};

const mapKatalogRow = (row) => {
  const get = (key) => {
    const match = Object.entries(row).find(([k]) => normalizeHeader(k) === normalizeHeader(key));
    return match ? String(match[1]).trim() : "";
  };

  const status = get("status") || "Planned";
  const pages = parseIntSafe(get("pages"));
  const currentPage = parseIntSafe(get("currentPage")) ?? 0;
  const chapters = parseIntSafe(get("chapters"));
  const currentChapter = parseIntSafe(get("currentChapter")) ?? 0;
  let completionPercentage = parseIntSafe(get("completionPercentage")) ?? 0;

  if (!completionPercentage && pages) {
    completionPercentage = Math.min(100, Math.round((currentPage / pages) * 100));
  }

  const genreRaw = get("genre");
  const genre = genreRaw
    ? genreRaw.split(";").map((g) => g.trim()).filter(Boolean)
    : [];

  const timeline = {};
  const startedAt = parseDate(get("startedAt"));
  const completedAt = parseDate(get("completedAt"));
  if (startedAt) timeline.startedAt = startedAt;
  if (completedAt) timeline.completedAt = completedAt;

  return {
    title: get("title"),
    author: get("author") || "Unknown",
    status,
    pages,
    chapters,
    currentPage,
    currentChapter,
    completionPercentage,
    rating: parseRating(get("rating"), 5),
    notes: get("notes") || undefined,
    isbn: get("isbn") || undefined,
    genre,
    imageUrl: get("imageUrl") || undefined,
    timeline: Object.keys(timeline).length ? timeline : undefined,
    source: "katalog",
  };
};

export const mapImportRows = (rows, format) => {
  const mapper = format === "external" ? mapExternalRow : mapKatalogRow;

  return rows.map((row, index) => {
    try {
      const mapped = mapper(row);
      const issues = [];

      if (!mapped.title) issues.push("Missing title");
      if (!mapped.author) issues.push("Missing author");

      return {
        rowNumber: index + 2,
        valid: issues.length === 0,
        issues,
        data: mapped,
      };
    } catch (error) {
      return {
        rowNumber: index + 2,
        valid: false,
        issues: [error.message],
        data: null,
      };
    }
  });
};

export const buildBookDocument = (userId, mapped) => ({
  user: userId,
  title: mapped.title,
  author: mapped.author,
  status: mapped.status,
  pages: mapped.pages,
  chapters: mapped.chapters,
  currentPage: mapped.currentPage ?? 0,
  currentChapter: mapped.currentChapter ?? 0,
  completionPercentage: mapped.completionPercentage ?? 0,
  rating: mapped.rating ?? 0,
  notes: mapped.notes,
  isbn: mapped.isbn,
  genre: mapped.genre ?? [],
  imageUrl: mapped.imageUrl,
  timeline: mapped.timeline ?? {},
  readingVelocity: { avgPagesPerDay: 0, lastUpdated: new Date() },
});
