import TVShow from "../../model/tvShow.js";

export const getTVShowProgressAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const tvShow = await TVShow.findOne(
      { _id: id },
      {
        completionPercentage: 1,
        currentSeason: 1,
        currentEpisode: 1,
        totalSeasons: 1,
        totalEpisodes: 1,
        title: 1,
        status: 1,
        director: 1,
        cast: 1,
        duration: 1,
      }
    );

    if (!tvShow) {
      return res.status(404).json({ error: "TV show not found" });
    }

    const seasonProgress =
      tvShow.totalSeasons > 0
        ? Math.round((tvShow.currentSeason / tvShow.totalSeasons) * 100)
        : 0;

    const episodeProgress =
      tvShow.totalEpisodes > 0
        ? Math.round((tvShow.currentEpisode / tvShow.totalEpisodes) * 100)
        : 0;

    const analytics = {
      tvShowTitle: tvShow.title,
      director: tvShow.director,
      cast: tvShow.cast || [],
      status: tvShow.status,
      completionPercentage: tvShow.completionPercentage,
      seasonProgress: {
        current: tvShow.currentSeason || 0,
        total: tvShow.totalSeasons || 0,
        percentage: seasonProgress,
      },
      episodeProgress: {
        current: tvShow.currentEpisode || 0,
        total: tvShow.totalEpisodes || 0,
        percentage: episodeProgress,
      },
      episodeDuration: tvShow.duration || 0,
      recommendedMetric: tvShow.totalSeasons > 0 ? "seasons" : "episodes",
    };

    res.json(analytics);
  } catch (error) {
    console.error("Failed getting progress analytics", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
