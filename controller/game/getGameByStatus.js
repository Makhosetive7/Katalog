import Game from "../../model/game.js";

export const getGameByStatus = async (req, res) => {
  try {
    const { status } = req.params
    const validStatuses = ["Planned", "In-Progress", "Completed", "Dropped"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" })
    }

    const gameStatus = await Game.find({ status }).sort({ createdAt: -1 })

    res.status(200).json({
      status,
      count: gameStatus.length,
      books: gameStatus,
    })
  } catch (error) {
    console.error("Failed getting game by status:", error.message)
    res.status(500).json({ message: "Server error" })
  }
};
