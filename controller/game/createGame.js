import Game from "../../model/game.js";

export const createGame = async (req, res) => {
  try {
    const { title, platform, publisher, developer, status, rating } = req.body;

    if (!title || !platform || !publisher || !developer) {
      return res
        .status(400)
        .json({
          message: "Title, platform, publisher and developer are required",
        });
    }

    let newGame = new Game({
      title,
      platform,
      publisher,
      developer,
      status: status || "Planned",
      rating: rating || 0,
    });

    const saveGame = await newGame.save();

    res.status(201).json({
      message: "New game created now waiting for you to begin play",
      game: saveGame,
    });
  } catch (error) {
    console.error("Failed creating a game catalog:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
