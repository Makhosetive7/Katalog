import Game from "../../model/game.js";

export const getGameProgressById = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id)

    if (!game) {
      return res.status(404).json({ error: "Game not found" })
    }

    const progress = {
      id: game._id,
      title: game.title,
      currentLevel: game.currentLevel,
      completionPercentage: game.completionPercentage,
      status: game.status,
      playtime: game.playtime || 0,
      developer: game.developer,
      publisher: game.publisher,
      metric: "hours",
      color: game.status === "Completed" ? "#4caf50" : "#2196f3",
    }

    res.status(200).json({ progress })
  } catch (error) {
    console.error("Failed to fetch game progress:", error.message)
    res.status(500).json({ error: "Server error" })
  }
};
