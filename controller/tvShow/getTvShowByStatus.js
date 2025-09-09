import TvShow from "../../model/tvShow.js";

export const getTvShowByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Planned", "In-Progress", "Completed", "Dropped"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const tvShowStatus = await TvShow.find({ status }).sort({ createdAt: -1 });

    res.status(200).json({
      status,
      count: tvShowStatus.length,
      books: tvShowStatus,
    });
  } catch (error) {
    console.error("Failed getting show by status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
