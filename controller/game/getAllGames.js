import Games from "../../model/game.js";

export const getAllGames = async (req, res) => {
  try {
    const games = await Games.find()
    res.json(games)
  } catch (error) {
    console.log("Failed getting all games")
    res.status(500).json({ error: error.message })
  }
};