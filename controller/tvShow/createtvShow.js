import TvShow from "../../model/tvShow.js";

export const createTvShow = async (req, res) => {
  try {
    const {
      title,
      genre,
      totalSeasons,
      totalEpisodes,
      cast,
      duration,
      director,
      status,
      rating,
    } = req.body;

    if (!title || !genre) {
      return res.status(400).json({
        message: "Title, genre are required",
      });
    }

    let newTvShow = new TvShow({
      title,
      genre,
      totalSeasons: totalSeasons || 1,
      totalEpisodes: totalEpisodes || 6,
      cast,
      duration,
      director,
      status: status || "Planned",
      rating: rating || 0,
    });

    const saveTvShow = await newTvShow.save();

    res.status(201).json({
      message: "New Tv show has been created now now its time to binge",
      game: saveTvShow,
    });
  } catch (error) {
    console.error("Failed creating a tvShow catalog:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
