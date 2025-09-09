import TVShow from "../../model/tvShow.js";

export const getAllTVShowProgress = async (req, res) => {
  try {
    const tvShows = await TVShow.find(
      { status: { $in: ["In-Progress", "Completed", "Dropped"] } },
      {
        title: 1,
        completionPercentage: 1,
        status: 1,
        currentSeason: 1,
        currentEpisode: 1,
        totalSeasons: 1,
        totalEpisodes: 1,
      }
    ).sort({ completionPercentage: -1 });

    const progressData = tvShows.map((show) => ({
      id: show._id,
      title: show.title,
      completionPercentage: show.completionPercentage,
      status: show.status,
      currentSeason: show.currentSeason || 0,
      currentEpisode: show.currentEpisode || 0,
      totalSeasons: show.totalSeasons || 0,
      totalEpisodes: show.totalEpisodes || 0,
      progress:
        show.currentSeason && show.totalSeasons
          ? Math.round((show.currentSeason / show.totalSeasons) * 100)
          : show.completionPercentage,
      color: show.status === "Completed" ? "#4caf50" : "#2196f3",
    }));

    const totalShows = tvShows.length;
    const completedShows = tvShows.filter(
      (s) => s.status === "Completed"
    ).length;
    const averageCompletion =
      totalShows > 0
        ? Math.round(
            tvShows.reduce((sum, show) => sum + show.completionPercentage, 0) /
              totalShows
          )
        : 0;

    res.json({
      tvShows: progressData,
      statistics: {
        totalShows,
        completedShows,
        inProgressShows: totalShows - completedShows,
        averageCompletion,
        completionRate:
          totalShows > 0 ? Math.round((completedShows / totalShows) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Failed getting all TV shows progress:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
