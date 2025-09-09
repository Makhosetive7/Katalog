import Game from "../../model/game.js"

export const updateGameProgress = async (req, res) => {
  try {
    const { playtime, currentLevel, status } = req.body;
    const {id} = req.params;

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (playtime !== undefined) {
      if (playtime < 0) {
        return res.status(400).json({
          message: "Playtime cannot be negative",
        });
      }
      game.playtime = playtime;
    }

    if (currentLevel !== undefined) {
      if (currentLevel < 0) {
        return res.status(400).json({
          message: "Current level cannot be negative",
        });
      }
      game.currentLevel = currentLevel;
    }

    if (status) {
      game.status = status;
    }


    if (game.playtime > 0) {
      game.completionPercentage = Math.min(Math.round((game.playtime / 100) * 100), 100);
    }

    if (game.completionPercentage >= 100 && game.status !== "Completed") {
      game.status = "Completed";
      game.timeline.completedAt = new Date();
      if (game.timeline.startedAt) {
        game.timeline.timeSpent = (game.timeline.completedAt - game.timeline.startedAt) / (1000 * 60 * 60);
      }
    } else if (game.completionPercentage > 0 && game.status === "Planned") {
      game.status = "In-Progress";
      if (!game.timeline.startedAt) {
        game.timeline.startedAt = new Date();
      }
    }

    const updatedGame = await game.save();

    res.json({
      message: "Game progress updated successfully",
      game: updatedGame,
      completionPercentage: updatedGame.completionPercentage,
    });
  } catch (error) {
    console.log("Failed updating game progress:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};