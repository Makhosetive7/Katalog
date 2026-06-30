import ReadingActivity from "../../../model/readingActivity.js";

export function toDateKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Log any user reading activity for today — progress, notes, finishing a book, etc.
 */
export async function logUserReadingActivity(
  userId,
  {
    pagesDelta = 0,
    progressUpdate = false,
    noteAdded = false,
    bookStarted = false,
    bookCompleted = false,
    date,
  } = {}
) {
  const hasActivity =
    pagesDelta > 0 ||
    progressUpdate ||
    noteAdded ||
    bookStarted ||
    bookCompleted;

  if (!hasActivity) return;

  const day = date ? startOfDay(date) : startOfDay();
  const inc = { sessions: 1 };

  if (pagesDelta > 0) inc.pagesLogged = pagesDelta;
  if (progressUpdate) inc.progressUpdates = 1;
  if (noteAdded) inc.notesAdded = 1;
  if (bookStarted) inc.booksStarted = 1;
  if (bookCompleted) inc.booksCompleted = 1;

  await ReadingActivity.findOneAndUpdate(
    { user: userId, date: day },
    {
      $inc: inc,
      $setOnInsert: { user: userId, date: day },
    },
    { upsert: true }
  );
}

/** @deprecated use logUserReadingActivity */
export async function recordReadingActivity(userId, { pagesDelta = 0 } = {}) {
  await logUserReadingActivity(userId, { pagesDelta, progressUpdate: true });
}

export async function upsertReadingActivityDay(userId, date, data) {
  const day = startOfDay(date);
  await ReadingActivity.findOneAndUpdate(
    { user: userId, date: day },
    {
      $set: {
        sessions: Math.max(data.sessions ?? 1, 1),
        pagesLogged: Math.max(data.pagesLogged ?? 0, 0),
        progressUpdates: data.progressUpdates ?? 0,
        notesAdded: data.notesAdded ?? 0,
        booksStarted: data.booksStarted ?? 0,
        booksCompleted: data.booksCompleted ?? 0,
      },
      $setOnInsert: { user: userId, date: day },
    },
    { upsert: true }
  );
}
