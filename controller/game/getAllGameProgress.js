import Game from "../../model/game.js";

export const getAllGameProgress = async (req, res) => {
  try {
    const games = await Game.find(
      { status: { $in: ["In-Progress", "Completed", "Dropped"] } },
      {
        title: 1,
        completionPercentage: 1,
        status: 1,
        currentLevel: 1,
        playtime: 1,
      }
    ).sort({ completionPercentage: -1 })

    const progressData = games.map((game) => ({
      id: game._id,
      title: game.title,
      completionPercentage: game.completionPercentage,
      status: game.status,
      currentLevel: game.currentLevel,
      playtime: game.playtime || 0,
      color: game.status === "Completed" ? "#4caf50" : "#2196f3",
    }));

    const totalGames = games.length;
    const completedGames = games.filter((g) => g.status === "Completed").length
    const averageCompletion =
      totalGames > 0
        ? Math.round(
            games.reduce((sum, game) => sum + game.completionPercentage, 0) /
              totalGames
          )
        : 0;

    res.json({
      games: progressData,
      statistics: {
        totalGames,
        completedGames,
        inProgressGames: totalGames - completedGames,
        averageCompletion,
        completionRate:
          totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Failed getting all games progress:", error.message)
    res.status(500).json({ error: "Server error" });
  }
};
