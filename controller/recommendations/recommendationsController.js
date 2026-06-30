import Book from "../../model/book.js";

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;

    const [completed, inProgress, planned] = await Promise.all([
      Book.find({ user: userId, status: "Completed" }),
      Book.find({ user: userId, status: "In-Progress" }).sort({ updatedAt: -1 }),
      Book.find({ user: userId, status: "Planned" }).sort({ createdAt: -1 }).limit(5),
    ]);

    const genreCounts = {};
    for (const book of completed) {
      const genres = Array.isArray(book.genre) ? book.genre : book.genre ? [book.genre] : [];
      for (const g of genres) {
        const key = String(g).toLowerCase();
        genreCounts[key] = (genreCounts[key] || 0) + 1;
      }
    }

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre, count]) => ({ genre, count }));

    const continueReading = inProgress.slice(0, 5).map((b) => {
      const pagesLeft = Math.max(0, (b.pages || 0) - (b.currentPage || 0));
      const pace = parseFloat(b.readingVelocity?.avgPagesPerDay) || 0;
      return {
        id: b._id,
        title: b.title,
        author: b.author,
        completionPercentage: b.completionPercentage,
        pagesLeft,
        daysToFinish: pace > 0 ? Math.ceil(pagesLeft / pace) : null,
        reason: "Continue where you left off",
      };
    });

    const upNext = planned.slice(0, 3).map((b) => ({
      id: b._id,
      title: b.title,
      author: b.author,
      reason: "On your to-read shelf",
    }));

    const genreSuggestions = topGenres.map((g) => ({
      genre: g.genre,
      message: `You've enjoyed ${g.count} ${g.genre} book${g.count === 1 ? "" : "s"}. Explore more in this genre.`,
    }));

    res.json({
      continueReading,
      upNext,
      topGenres,
      genreSuggestions,
      readingTip:
        inProgress.length > 3
          ? "You have several books in progress. Finishing one can boost your completion rate."
          : inProgress.length === 0 && planned.length > 0
            ? "Pick a book from your shelf and start a reading session today."
            : null,
    });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
