import TvShow from "../../model/tvShow.js";

export const getAllShows = async (req, res) => {
  try {
    const tvShows = await TvShow.find();
    res.json(tvShows);
  } catch (error) {
    console.log("Failed getting all tvShows");
    res.status(500).json({ error: error.message });
  }
};
