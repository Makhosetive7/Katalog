import Book from "../../model/book.js";
import ChapterNote from "../../model/chapterNote.js";
import ReadingGoal from "../../model/readingGoals.js";

const escapeCsv = (value) => {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportBooksCsv = async (req, res) => {
  try {
    const userId = req.userId;
    const books = await Book.find({ user: userId }).sort({ createdAt: -1 });

    const headers = [
      "title",
      "author",
      "status",
      "genre",
      "pages",
      "currentPage",
      "chapters",
      "currentChapter",
      "completionPercentage",
      "rating",
      "startedAt",
      "completedAt",
    ];

    const rows = books.map((b) =>
      [
        b.title,
        b.author,
        b.status,
        Array.isArray(b.genre) ? b.genre.join("; ") : b.genre,
        b.pages,
        b.currentPage,
        b.chapters,
        b.currentChapter,
        b.completionPercentage,
        b.rating,
        b.timeline?.startedAt?.toISOString?.() ?? "",
        b.timeline?.completedAt?.toISOString?.() ?? "",
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="katalog-books.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const exportLibraryJson = async (req, res) => {
  try {
    const userId = req.userId;
    const [books, notes, goals] = await Promise.all([
      Book.find({ user: userId }),
      ChapterNote.find({ user: userId }),
      ReadingGoal.find({ user: userId }),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      books,
      notes,
      goals,
    });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
