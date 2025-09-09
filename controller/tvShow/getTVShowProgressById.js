import TVShow from "../../model/tvShow.js";

export const getTVShowProgressById = async (req, res) => {
  try {
    const { id } = req.params;

    const tvShow = await TVShow.findOne({ _id: id, user: req.user._id });

    if (!tvShow) {
      return res.status(404).json({ error: "TV show not found" });
    }

    const progress = {
      id: tvShow._id,
      title: tvShow.title,
      currentSeason: tvShow.currentSeason || 0,
      currentEpisode: tvShow.currentEpisode || 0,
      totalSeasons: tvShow.totalSeasons || 0,
      totalEpisodes: tvShow.totalEpisodes || 0,
      completionPercentage: tvShow.completionPercentage,
      status: tvShow.status,
      director: tvShow.director,
      cast: tvShow.cast || [],
      episodeDuration: tvShow.duration || 0,
      metric: tvShow.totalSeasons > 0 ? "seasons" : "episodes",
      color: tvShow.status === "Completed" ? "#4caf50" : "#2196f3",
    };

    res.status(200).json({ progress });
  } catch (error) {
    console.error("Failed to fetch TV show progress:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};