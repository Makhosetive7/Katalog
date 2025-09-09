import TvShow from "../../model/tvShow.js";

export const getTvShowById = async (req, res) => {
  try {
    const { id } = req.params

    let showId = await TvShow.findById(id)

    if (!showId) {
      return res.status(404).json({ error: "TvShow not available" })
    }

    res.status(200).json(showId);
  } catch (error) {
    console.error("Failed fetching show by ID:", error.message)
    res.status(500).json({ error: "Server error" })
  }
};
