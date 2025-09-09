import TVShow from "../../model/tvShow.js";

export const updateTVShowProgress = async (req, res) => {
  try {
    const { currentSeason, currentEpisode, status } = req.body;
    const { id } = req.params;

    const tvShow = await TVShow.findOne({ _id: id });

    if (!tvShow) {
      return res.status(404).json({ message: "TV show not found" });
    }

    if (currentSeason !== undefined) {
      if (currentSeason < 0) {
        return res.status(400).json({
          message: "Current season cannot be negative",
        });
      }
      if (tvShow.totalSeasons && currentSeason > tvShow.totalSeasons) {
        return res.status(400).json({
          message: "Current season cannot exceed total seasons",
        });
      }
      tvShow.currentSeason = currentSeason;
    }

    if (currentEpisode !== undefined) {
      if (currentEpisode < 0) {
        return res.status(400).json({
          message: "Current episode cannot be negative",
        });
      }
      if (tvShow.totalEpisodes && currentEpisode > tvShow.totalEpisodes) {
        return res.status(400).json({
          message: "Current episode cannot exceed total episodes",
        });
      }
      tvShow.currentEpisode = currentEpisode;
    }

    if (status) {
      tvShow.status = status;
    }

    if (tvShow.totalSeasons > 0 && tvShow.currentSeason > 0) {
      tvShow.completionPercentage = Math.round((tvShow.currentSeason / tvShow.totalSeasons) * 100);
    } else if (tvShow.totalEpisodes > 0 && tvShow.currentEpisode > 0) {
      tvShow.completionPercentage = Math.round((tvShow.currentEpisode / tvShow.totalEpisodes) * 100);
    }

    tvShow.completionPercentage = Math.min(tvShow.completionPercentage, 100);

    if (tvShow.completionPercentage >= 100 && tvShow.status !== "Completed") {
      tvShow.status = "Completed";
      tvShow.timeline.completedAt = new Date();
      if (tvShow.timeline.startedAt) {
        tvShow.timeline.timeSpent = (tvShow.timeline.completedAt - tvShow.timeline.startedAt) / (1000 * 60 * 60);
      }
    } else if (tvShow.completionPercentage > 0 && tvShow.status === "Planned") {
      tvShow.status = "In-Progress";
      if (!tvShow.timeline.startedAt) {
        tvShow.timeline.startedAt = new Date();
      }
    }

    const updatedTVShow = await tvShow.save();

    res.json({
      message: "TV show progress updated successfully",
      tvShow: updatedTVShow,
      completionPercentage: updatedTVShow.completionPercentage,
    });
  } catch (error) {
    console.log("Failed updating TV show progress:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};