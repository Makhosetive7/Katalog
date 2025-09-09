import TvShow from "../../model/tvShow.js";

export const deleteTvShow = async (req, res) => {
  try {
    const { id } = req.params;

    const showDeletion = await TvShow.findByIdAndDelete(id);

    if (!showDeletion) {
      return res.status(404).json({ message: "TvShow not found" });
    }

    res.status(200).json({ message: "TvShow deleted successfully" });
  } catch (error) {
    console.error("Failed deleting TvShow:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
