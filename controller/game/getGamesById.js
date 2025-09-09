import Games from "../../model/game.js";

export const getGamesById = async (req, res) => {
  try {
    const { id } = req.params

    let gameIdentity = await Games.findById(id)

    if (!gameIdentity) {
      return res.status(404).json({ error: "Games not available" })
    }

    res.status(200).json(gameIdentity);
  } catch (error) {
    console.error("Failed fetching game by ID:", error.message)
    res.status(500).json({ error: "Server error" })
  }
};
