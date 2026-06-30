import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../model/user/user.js";
import Book from "../model/book.js";
import ChapterNote from "../model/chapterNote.js";
import ReadingGoal from "../model/readingGoals.js";
import ReadingStreak from "../model/readingStreak.js";
import Achievement from "../model/readingAchiervements.js";
import ReadingChallenge from "../model/readingChallange.js";
import ReadingActivity from "../model/readingActivity.js";

dotenv.config();

const SEED_PASSWORD = "password123";
const SEED_EMAILS = ["maya.chen@example.com", "sophie.romero@example.com"];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(14, 30, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const hoursBetween = (start, end) =>
  Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const seedReadingActivity = async (userId, streakDoc, joinedAt) => {
  const year = new Date().getFullYear();
  const activityDays = new Map();

  const addDay = (date, sessions, pages, extra = {}) => {
    const day = startOfDay(date);
    if (day.getFullYear() !== year || day > new Date()) return;
    const key = day.toISOString();
    const existing = activityDays.get(key) ?? {
      date: day,
      sessions: 0,
      pages: 0,
      progressUpdates: 0,
      notesAdded: 0,
      booksStarted: 0,
      booksCompleted: 0,
    };
    existing.sessions += sessions;
    existing.pages += pages;
    existing.progressUpdates += extra.progressUpdates ?? (sessions > 0 ? 1 : 0);
    existing.notesAdded += extra.notesAdded ?? 0;
    existing.booksStarted += extra.booksStarted ?? 0;
    existing.booksCompleted += extra.booksCompleted ?? 0;
    activityDays.set(key, existing);
  };

  const walkRange = (start, end, intensity = 1) => {
    const cursor = startOfDay(start);
    const last = startOfDay(end);
    while (cursor <= last) {
      if (cursor.getDay() !== 0 || intensity > 1) {
        addDay(
          cursor,
          1 + (cursor.getDate() % 2),
          10 + (cursor.getDate() % 30) * intensity
        );
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  };

  for (const entry of streakDoc.streakHistory ?? []) {
    if (entry?.startDate && entry?.endDate) {
      walkRange(entry.startDate, entry.endDate, 1.2);
    }
  }

  if (streakDoc.lastReadingDate && streakDoc.currentStreak > 0) {
    const end = startOfDay(streakDoc.lastReadingDate);
    const start = new Date(end);
    start.setDate(start.getDate() - (streakDoc.currentStreak - 1));
    walkRange(start, end, 1.5);
  }

  for (let offset = 0; offset < 120; offset += 4) {
    const day = addDays(joinedAt, offset);
    if (day > new Date()) break;
    if (offset % 11 === 0) continue;
    addDay(day, 1, 6 + (offset % 18));
  }

  const docs = [...activityDays.values()].map((entry) => ({
    user: userId,
    date: entry.date,
    sessions: entry.sessions,
    pagesLogged: entry.pages,
    progressUpdates: entry.progressUpdates,
    notesAdded: entry.notesAdded,
    booksStarted: entry.booksStarted,
    booksCompleted: entry.booksCompleted,
  }));

  if (docs.length) {
    await ReadingActivity.insertMany(docs);
  }
};

const clearSeedUsers = async () => {
  const existingUsers = await User.find({ email: { $in: SEED_EMAILS } });
  for (const user of existingUsers) {
    const userId = user._id;
    await Book.deleteMany({ user: userId });
    await ChapterNote.deleteMany({ user: userId });
    await ReadingGoal.deleteMany({ user: userId });
    await ReadingStreak.deleteMany({ user: userId });
    await Achievement.deleteMany({ user: userId });
    await ReadingChallenge.deleteMany({ user: userId });
    await ReadingActivity.deleteMany({ user: userId });
    await User.deleteOne({ _id: userId });
  }
};

const createBook = async (userId, data) => {
  const {
    pages,
    chapters,
    status,
    progressPct = 0,
    startedAt,
    completedAt,
    createdAt,
    updatedAt,
    avgPagesPerDay = 0,
    ...rest
  } = data;

  const isComplete = status === "Completed";
  const currentPage = isComplete
    ? pages
    : Math.round((pages * progressPct) / 100);
  const currentChapter = isComplete
    ? chapters
    : Math.max(1, Math.round((chapters * progressPct) / 100));

  return Book.create({
    user: userId,
    pages,
    chapters,
    currentPage,
    currentChapter,
    status,
    completionPercentage: isComplete ? 100 : progressPct,
    timeline: {
      startedAt: startedAt ?? null,
      completedAt: completedAt ?? null,
      timeSpent:
        startedAt && completedAt ? hoursBetween(startedAt, completedAt) : null,
    },
    readingVelocity: {
      avgPagesPerDay,
      lastUpdated: updatedAt ?? createdAt ?? new Date(),
    },
    createdAt,
    updatedAt: updatedAt ?? createdAt ?? new Date(),
    ...rest,
  });
};

const seedStudent = async () => {
  const joinedAt = daysAgo(118); // ~4 months ago

  const user = await User.create({
    username: "maya_student",
    email: "maya.chen@example.com",
    password: SEED_PASSWORD,
    isVerified: true,
    profile: {
      firstName: "Maya",
      lastName: "Chen",
      bio: "High school junior keeping track of textbooks, assigned reading, and exam prep.",
      readingPreferences: ["Textbooks", "Non-Fiction", "Classics", "Study Guides"],
    },
    preferences: {
      emailNotifications: true,
      privacy: "private",
    },
    createdAt: joinedAt,
    updatedAt: joinedAt,
  });

  const books = [];

  books.push(
    await createBook(user._id, {
      title: "Campbell Biology",
      author: "Lisa A. Urry",
      genre: ["Textbook", "Science", "Biology"],
      pages: 1488,
      chapters: 56,
      status: "Completed",
      rating: 7,
      notes: "Finished before the AP Bio unit test. Cell division chapters were the hardest.",
      startedAt: addDays(joinedAt, 4),
      completedAt: addDays(joinedAt, 78),
      createdAt: addDays(joinedAt, 3),
      updatedAt: addDays(joinedAt, 78),
      avgPagesPerDay: 22,
    })
  );

  books.push(
    await createBook(user._id, {
      title: "Algebra 2: Common Core Edition",
      author: "Randall I. Charles",
      genre: ["Textbook", "Mathematics"],
      pages: 912,
      chapters: 14,
      status: "In-Progress",
      progressPct: 68,
      rating: 6,
      notes: "Working through polynomial functions before finals.",
      startedAt: addDays(joinedAt, 45),
      createdAt: addDays(joinedAt, 44),
      updatedAt: daysAgo(2),
      avgPagesPerDay: 8,
      readingGoal: {
        targetPages: 912,
        targetChapters: 14,
        deadline: addDays(new Date(), 21),
        completed: false,
      },
    })
  );

  books.push(
    await createBook(user._id, {
      title: "The American Pageant",
      author: "David M. Kennedy",
      genre: ["Textbook", "History", "Non-Fiction"],
      pages: 1152,
      chapters: 42,
      status: "Completed",
      rating: 8,
      notes: "Great for APUSH — timelines at the end of each chapter helped a lot.",
      startedAt: addDays(joinedAt, 20),
      completedAt: addDays(joinedAt, 95),
      createdAt: addDays(joinedAt, 18),
      updatedAt: addDays(joinedAt, 95),
      avgPagesPerDay: 14,
    })
  );

  books.push(
    await createBook(user._id, {
      title: "Chemistry: The Central Science",
      author: "Theodore E. Brown",
      genre: ["Textbook", "Science", "Chemistry"],
      pages: 1248,
      chapters: 25,
      status: "In-Progress",
      progressPct: 42,
      rating: 7,
      notes: "Stoichiometry unit done. Starting acids and bases next week.",
      startedAt: addDays(joinedAt, 60),
      createdAt: addDays(joinedAt, 58),
      updatedAt: daysAgo(1),
      avgPagesPerDay: 11,
      readingGoal: {
        targetPages: 600,
        targetChapters: 12,
        deadline: addDays(new Date(), 35),
        completed: false,
      },
    })
  );

  books.push(
    await createBook(user._id, {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      genre: ["Fiction", "Classics", "Literature"],
      pages: 376,
      chapters: 31,
      status: "Completed",
      rating: 9,
      notes: "English class assigned reading. Courtroom scenes were unforgettable.",
      startedAt: addDays(joinedAt, 30),
      completedAt: addDays(joinedAt, 42),
      createdAt: addDays(joinedAt, 28),
      updatedAt: addDays(joinedAt, 42),
      avgPagesPerDay: 31,
    })
  );

  books.push(
    await createBook(user._id, {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      genre: ["Fiction", "Classics", "Literature"],
      pages: 180,
      chapters: 9,
      status: "Completed",
      rating: 8,
      notes: "Short but dense. Wrote my essay on the green light symbolism.",
      startedAt: addDays(joinedAt, 70),
      completedAt: addDays(joinedAt, 76),
      createdAt: addDays(joinedAt, 69),
      updatedAt: addDays(joinedAt, 76),
      avgPagesPerDay: 30,
    })
  );

  books.push(
    await createBook(user._id, {
      title: "Physics: Principles and Problems",
      author: "Paul W. Zitzewitz",
      genre: ["Textbook", "Science", "Physics"],
      pages: 880,
      chapters: 30,
      status: "Planned",
      progressPct: 0,
      rating: 0,
      notes: "Fall semester — need this for mechanics unit.",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10),
    })
  );

  books.push(
    await createBook(user._id, {
      title: "The Official SAT Study Guide",
      author: "The College Board",
      genre: ["Study Guide", "Non-Fiction"],
      pages: 1300,
      chapters: 10,
      status: "In-Progress",
      progressPct: 28,
      rating: 6,
      notes: "Doing one practice test section per weekend.",
      startedAt: addDays(joinedAt, 90),
      createdAt: addDays(joinedAt, 88),
      updatedAt: daysAgo(4),
      avgPagesPerDay: 5,
    })
  );

  const completedBooks = books.filter((b) => b.status === "Completed");

  await ChapterNote.create([
    {
      user: user._id,
      book: books[0]._id,
      chapter: 12,
      note: "Mitosis vs meiosis — draw the diagrams again before the quiz.",
      keywords: ["mitosis", "meiosis", "cell division"],
      createdAt: addDays(joinedAt, 35),
      updatedAt: addDays(joinedAt, 35),
    },
    {
      user: user._id,
      book: books[0]._id,
      chapter: 28,
      note: "Ecology food webs — remember 10% energy transfer rule.",
      keywords: ["ecology", "energy", "food web"],
      createdAt: addDays(joinedAt, 65),
      updatedAt: addDays(joinedAt, 65),
    },
    {
      user: user._id,
      book: books[2]._id,
      chapter: 15,
      note: "Civil War causes: sectionalism, slavery, states' rights — essay outline here.",
      keywords: ["civil war", "APUSH", "essay"],
      createdAt: addDays(joinedAt, 55),
      updatedAt: addDays(joinedAt, 55),
    },
    {
      user: user._id,
      book: books[4]._id,
      chapter: 20,
      note: "Tom Robinson verdict — connect to Atticus's closing argument.",
      keywords: ["mockingbird", "theme", "justice"],
      createdAt: addDays(joinedAt, 38),
      updatedAt: addDays(joinedAt, 38),
    },
    {
      user: user._id,
      book: books[1]._id,
      chapter: 8,
      note: "Quadratic formula cheat sheet — vertex form conversions.",
      keywords: ["quadratics", "math", "formulas"],
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
  ]);

  await ReadingGoal.create([
    {
      user: user._id,
      book: books[1]._id,
      type: "pages",
      target: 200,
      timeFrame: "monthly",
      startDate: daysAgo(30),
      endDate: daysAgo(0),
      completed: true,
      completedAt: daysAgo(3),
      progress: 200,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(3),
    },
    {
      user: user._id,
      book: books[3]._id,
      type: "chapters",
      target: 6,
      timeFrame: "weekly",
      startDate: daysAgo(14),
      endDate: addDays(new Date(), 7),
      completed: false,
      progress: 3,
      createdAt: daysAgo(14),
      updatedAt: daysAgo(1),
    },
    {
      user: user._id,
      book: books[7]._id,
      type: "pages",
      target: 100,
      timeFrame: "weekly",
      startDate: daysAgo(7),
      endDate: addDays(new Date(), 7),
      completed: false,
      progress: 45,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(2),
    },
  ]);

  const streak = await ReadingStreak.create({
    user: user._id,
    currentStreak: 6,
    longestStreak: 14,
    lastReadingDate: daysAgo(0),
    streakHistory: [
      { startDate: addDays(joinedAt, 4), endDate: addDays(joinedAt, 17), length: 14 },
      { startDate: addDays(joinedAt, 25), endDate: addDays(joinedAt, 31), length: 7 },
      { startDate: addDays(joinedAt, 50), endDate: addDays(joinedAt, 58), length: 9 },
      { startDate: daysAgo(6), endDate: daysAgo(0), length: 6 },
    ],
    createdAt: addDays(joinedAt, 4),
    updatedAt: daysAgo(0),
  });

  await seedReadingActivity(user._id, streak, joinedAt);

  await Achievement.create([
    {
      user: user._id,
      type: "books_read",
      level: "beginner",
      title: "Novice Reader",
      description: "Read 1 books",
      earnedAt: addDays(joinedAt, 42),
      metadata: { value: 1, bookId: books[4]._id },
      createdAt: addDays(joinedAt, 42),
      updatedAt: addDays(joinedAt, 42),
    },
    {
      user: user._id,
      type: "streak_length",
      level: "bronze",
      title: "Weekly Reader",
      description: "Maintained a 7-day reading streak",
      earnedAt: addDays(joinedAt, 31),
      metadata: { value: 7 },
      createdAt: addDays(joinedAt, 31),
      updatedAt: addDays(joinedAt, 31),
    },
    {
      user: user._id,
      type: "pages_read",
      level: "bronze",
      title: "Page Turner",
      description: "Logged over 2,000 pages of reading",
      earnedAt: addDays(joinedAt, 80),
      metadata: { value: 2000 },
      createdAt: addDays(joinedAt, 80),
      updatedAt: addDays(joinedAt, 80),
    },
  ]);

  await ReadingChallenge.create({
    user: user._id,
    year: 2026,
    goal: 15,
    currentCount: completedBooks.length,
    completed: false,
    books: completedBooks.map((b) => b._id),
    createdAt: joinedAt,
    updatedAt: daysAgo(1),
  });

  return user;
};

const seedNovelLover = async () => {
  const joinedAt = daysAgo(122);

  const user = await User.create({
    username: "sophie_reads",
    email: "sophie.romero@example.com",
    password: SEED_PASSWORD,
    isVerified: true,
    profile: {
      firstName: "Sophie",
      lastName: "Romero",
      bio: "Novel enthusiast. Always juggling two books — one on the nightstand, one on Kindle.",
      readingPreferences: [
        "Fiction",
        "Literary Fiction",
        "Romance",
        "Mystery",
        "Fantasy",
      ],
    },
    preferences: {
      emailNotifications: true,
      privacy: "public",
    },
    createdAt: joinedAt,
    updatedAt: joinedAt,
  });

  const books = [];

  const novel = async (data) => {
    const book = await createBook(user._id, data);
    books.push(book);
    return book;
  };

  await novel({
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    genre: ["Fantasy", "Romance", "Fiction"],
    pages: 517,
    chapters: 52,
    status: "Completed",
    rating: 9,
    notes: "Dragons + military academy = instant favorite. Xaden is impossible.",
    startedAt: addDays(joinedAt, 2),
    completedAt: addDays(joinedAt, 9),
    createdAt: addDays(joinedAt, 1),
    updatedAt: addDays(joinedAt, 9),
    avgPagesPerDay: 74,
  });

  await novel({
    title: "Iron Flame",
    author: "Rebecca Yarros",
    genre: ["Fantasy", "Romance", "Fiction"],
    pages: 623,
    chapters: 60,
    status: "Completed",
    rating: 8,
    notes: "Even more intense than book one. That ending though...",
    startedAt: addDays(joinedAt, 10),
    completedAt: addDays(joinedAt, 18),
    createdAt: addDays(joinedAt, 10),
    updatedAt: addDays(joinedAt, 18),
    avgPagesPerDay: 78,
  });

  await novel({
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: ["Fiction", "Historical Fiction", "LGBTQ+"],
    pages: 400,
    chapters: 40,
    status: "Completed",
    rating: 10,
    notes: "Cried on the subway. Evelyn and Monique's story is perfection.",
    startedAt: addDays(joinedAt, 22),
    completedAt: addDays(joinedAt, 27),
    createdAt: addDays(joinedAt, 21),
    updatedAt: addDays(joinedAt, 27),
    avgPagesPerDay: 80,
  });

  await novel({
    title: "Remarkably Bright Creatures",
    author: "Shelby Van Pelt",
    genre: ["Fiction", "Literary Fiction", "Contemporary"],
    pages: 368,
    chapters: 36,
    status: "Completed",
    rating: 9,
    notes: "Marcellus the octopus stole every scene. Cozy but heartbreaking.",
    startedAt: addDays(joinedAt, 35),
    completedAt: addDays(joinedAt, 40),
    createdAt: addDays(joinedAt, 34),
    updatedAt: addDays(joinedAt, 40),
    avgPagesPerDay: 74,
  });

  await novel({
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    genre: ["Mystery", "Fiction", "Humor"],
    pages: 382,
    chapters: 38,
    status: "Completed",
    rating: 8,
    notes: "Retirees solving murders — charming and clever.",
    startedAt: addDays(joinedAt, 48),
    completedAt: addDays(joinedAt, 53),
    createdAt: addDays(joinedAt, 47),
    updatedAt: addDays(joinedAt, 53),
    avgPagesPerDay: 76,
  });

  await novel({
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: ["Science Fiction", "Fiction", "Adventure"],
    pages: 496,
    chapters: 30,
    status: "Completed",
    rating: 10,
    notes: "Rocky!!! Best sci-fi friendship since The Martian.",
    startedAt: addDays(joinedAt, 58),
    completedAt: addDays(joinedAt, 64),
    createdAt: addDays(joinedAt, 57),
    updatedAt: addDays(joinedAt, 64),
    avgPagesPerDay: 83,
  });

  await novel({
    title: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    genre: ["Fiction", "Historical Fiction", "Literary Fiction"],
    pages: 400,
    chapters: 40,
    status: "Completed",
    rating: 9,
    notes: "Elizabeth Zott is iconic. Six-Thirty is the goodest boy.",
    startedAt: addDays(joinedAt, 70),
    completedAt: addDays(joinedAt, 76),
    createdAt: addDays(joinedAt, 69),
    updatedAt: addDays(joinedAt, 76),
    avgPagesPerDay: 67,
  });

  await novel({
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    genre: ["Fiction", "Literary Fiction", "Contemporary"],
    pages: 416,
    chapters: 42,
    status: "In-Progress",
    progressPct: 74,
    rating: 9,
    notes: "The game dev storyline is hitting close to home. Almost done!",
    startedAt: addDays(joinedAt, 95),
    createdAt: addDays(joinedAt, 94),
    updatedAt: daysAgo(0),
    avgPagesPerDay: 12,
  });

  await novel({
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    genre: ["Fantasy", "Fiction", "LGBTQ+"],
    pages: 394,
    chapters: 39,
    status: "Completed",
    rating: 10,
    notes: "Pure comfort read. Linus and Arthur — my heart.",
    startedAt: addDays(joinedAt, 82),
    completedAt: addDays(joinedAt, 87),
    createdAt: addDays(joinedAt, 81),
    updatedAt: addDays(joinedAt, 87),
    avgPagesPerDay: 79,
  });

  await novel({
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    genre: ["Fantasy", "Romance", "Fiction"],
    pages: 432,
    chapters: 46,
    status: "Completed",
    rating: 7,
    notes: "Fun escapism. Picked it up after Fourth Wing hype.",
    startedAt: addDays(joinedAt, 15),
    completedAt: addDays(joinedAt, 20),
    createdAt: addDays(joinedAt, 14),
    updatedAt: addDays(joinedAt, 20),
    avgPagesPerDay: 86,
  });

  await novel({
    title: "Beach Read",
    author: "Emily Henry",
    genre: ["Romance", "Fiction", "Contemporary"],
    pages: 384,
    chapters: 38,
    status: "Dropped",
    progressPct: 35,
    rating: 5,
    notes: "Not in the mood for romance that month. Might retry in summer.",
    startedAt: addDays(joinedAt, 88),
    createdAt: addDays(joinedAt, 87),
    updatedAt: addDays(joinedAt, 91),
    avgPagesPerDay: 27,
  });

  await novel({
    title: "Yellowface",
    author: "R.F. Kuang",
    genre: ["Fiction", "Literary Fiction", "Thriller"],
    pages: 336,
    chapters: 34,
    status: "Planned",
    progressPct: 0,
    rating: 0,
    notes: "Next up after I finish Tomorrow x3.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  });

  const completedBooks = books.filter((b) => b.status === "Completed");

  await ChapterNote.create([
    {
      user: user._id,
      book: books[0]._id,
      chapter: 34,
      note: "The rebellion reveal recontextualizes everything from chapter 1.",
      keywords: ["plot twist", "fourth wing", "xaden"],
      isPublic: true,
      createdAt: addDays(joinedAt, 7),
      updatedAt: addDays(joinedAt, 7),
    },
    {
      user: user._id,
      book: books[2]._id,
      chapter: 38,
      note: "The Monique reveal — I audibly gasped. Masterful structure.",
      keywords: ["evelyn hugo", "twist", "ending"],
      isPublic: true,
      createdAt: addDays(joinedAt, 27),
      updatedAt: addDays(joinedAt, 27),
    },
    {
      user: user._id,
      book: books[5]._id,
      chapter: 22,
      note: "Rocky learning English through math is the cutest thing ever written.",
      keywords: ["rocky", "sci-fi", "friendship"],
      isPublic: true,
      createdAt: addDays(joinedAt, 62),
      updatedAt: addDays(joinedAt, 62),
    },
    {
      user: user._id,
      book: books[7]._id,
      chapter: 28,
      note: "Sam and Sadie's creative partnership feels so real — the fight scene hurt.",
      keywords: ["tomorrow x3", "friendship", "games"],
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      user: user._id,
      book: books[8]._id,
      chapter: 20,
      note: "The children at the orphanage each have such distinct personalities.",
      keywords: ["cerulean sea", "found family", "cozy"],
      isPublic: true,
      createdAt: addDays(joinedAt, 85),
      updatedAt: addDays(joinedAt, 85),
    },
  ]);

  await ReadingGoal.create([
    {
      user: user._id,
      book: books[7]._id,
      type: "completion",
      target: 100,
      timeFrame: "custom",
      startDate: daysAgo(28),
      endDate: addDays(new Date(), 5),
      completed: false,
      progress: 74,
      createdAt: daysAgo(28),
      updatedAt: daysAgo(0),
    },
    {
      user: user._id,
      book: books[0]._id,
      type: "pages",
      target: 100,
      timeFrame: "daily",
      startDate: addDays(joinedAt, 2),
      endDate: addDays(joinedAt, 9),
      completed: true,
      completedAt: addDays(joinedAt, 9),
      progress: 517,
      createdAt: addDays(joinedAt, 2),
      updatedAt: addDays(joinedAt, 9),
    },
    {
      user: user._id,
      book: books[5]._id,
      type: "time",
      target: 10,
      timeFrame: "weekly",
      startDate: addDays(joinedAt, 58),
      endDate: addDays(joinedAt, 65),
      completed: true,
      completedAt: addDays(joinedAt, 64),
      progress: 12,
      createdAt: addDays(joinedAt, 58),
      updatedAt: addDays(joinedAt, 64),
    },
  ]);

  const streak = await ReadingStreak.create({
    user: user._id,
    currentStreak: 23,
    longestStreak: 23,
    lastReadingDate: daysAgo(0),
    streakHistory: [
      { startDate: addDays(joinedAt, 2), endDate: addDays(joinedAt, 24), length: 23 },
      { startDate: addDays(joinedAt, 30), endDate: addDays(joinedAt, 44), length: 15 },
      { startDate: addDays(joinedAt, 55), endDate: addDays(joinedAt, 76), length: 22 },
      { startDate: daysAgo(23), endDate: daysAgo(0), length: 23 },
    ],
    createdAt: addDays(joinedAt, 2),
    updatedAt: daysAgo(0),
  });

  await seedReadingActivity(user._id, streak, joinedAt);

  await Achievement.create([
    {
      user: user._id,
      type: "books_read",
      level: "beginner",
      title: "Novice Reader",
      description: "Read 1 books",
      earnedAt: addDays(joinedAt, 9),
      metadata: { value: 1, bookId: books[0]._id },
      createdAt: addDays(joinedAt, 9),
      updatedAt: addDays(joinedAt, 9),
    },
    {
      user: user._id,
      type: "streak_length",
      level: "bronze",
      title: "Weekly Reader",
      description: "Maintained a 7-day reading streak",
      earnedAt: addDays(joinedAt, 9),
      metadata: { value: 7 },
      createdAt: addDays(joinedAt, 9),
      updatedAt: addDays(joinedAt, 9),
    },
    {
      user: user._id,
      type: "streak_length",
      level: "silver",
      title: "Fortnight Fanatic",
      description: "Maintained a 14-day reading streak",
      earnedAt: addDays(joinedAt, 16),
      metadata: { value: 14 },
      createdAt: addDays(joinedAt, 16),
      updatedAt: addDays(joinedAt, 16),
    },
    {
      user: user._id,
      type: "genre_explorer",
      level: "silver",
      title: "Genre Explorer",
      description: "Read books from 7 different genres",
      earnedAt: addDays(joinedAt, 53),
      metadata: { value: 7 },
      createdAt: addDays(joinedAt, 53),
      updatedAt: addDays(joinedAt, 53),
    },
    {
      user: user._id,
      type: "speed_reader",
      level: "gold",
      title: "Speed Reader",
      description: "Finished a 500+ page book in under a week",
      earnedAt: addDays(joinedAt, 9),
      metadata: { value: 517, bookId: books[0]._id },
      createdAt: addDays(joinedAt, 9),
      updatedAt: addDays(joinedAt, 9),
    },
  ]);

  await ReadingChallenge.create({
    user: user._id,
    year: 2026,
    goal: 24,
    currentCount: completedBooks.length,
    completed: false,
    books: completedBooks.map((b) => b._id),
    createdAt: joinedAt,
    updatedAt: daysAgo(0),
  });

  return user;
};

const runSeed = async () => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    console.error(
      "Seed blocked in production. Set ALLOW_PROD_SEED=true only if you really intend to seed prod."
    );
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await connectDB();

  console.log("Clearing previous seed users (if any)...");
  await clearSeedUsers();

  console.log("Seeding student user (Maya Chen)...");
  const student = await seedStudent();

  console.log("Seeding novel lover user (Sophie Romero)...");
  const novelLover = await seedNovelLover();

  console.log("\nSeed complete!\n");
  console.log("Student — school books tracker:");
  console.log(`  Email:    ${student.email}`);
  console.log(`  Username: ${student.username}`);
  console.log(`  Password: ${SEED_PASSWORD}`);
  console.log("");
  console.log("Novel lover:");
  console.log(`  Email:    ${novelLover.email}`);
  console.log(`  Username: ${novelLover.username}`);
  console.log(`  Password: ${SEED_PASSWORD}`);

  await import("mongoose").then((m) => m.default.connection.close());
  process.exit(0);
};

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
