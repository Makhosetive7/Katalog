import Game from "../../model/game.js";
export const getGameProgressAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findOne(
      { _id: id },
      {
        completionPercentage: 1,
        playtime: 1,
        currentLevel: 1,
        title: 1,
        status: 1,
        platform: 1,
      }
    )

    if (!game) {
      return res.status(404).json({ error: "Game not found" })
    }

    const analytics = {
      gameTitle: game.title,
      platforms: game.platform,
      status: game.status,
      completionPercentage: game.completionPercentage,
      playtime: {
        hours: game.playtime || 0,
        formatted: game.playtime ? `${game.playtime} hours` : "0 hours",
      },
      currentLevel: game.currentLevel,
      progress: game.progress,
    }

    res.json(analytics)
  } catch (error) {
    console.error("Failed getting progress analytics", error.message)
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
