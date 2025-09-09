import Game from "../../model/game.js"

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params

    const gameDeletion = await Game.findByIdAndDelete(id)

    if (!gameDeletion) {
      return res.status(404).json({ message: "Game not found" })
    }

    res.status(200).json({ message: "Game deleted successfully" })
  } catch (error) {
    console.error("Failed deleting game:", error.message)
    res.status(500).json({ message: "Server error" })
  }
};