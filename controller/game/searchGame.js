import Game from "../../model/game.js";

export const searchGames = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const gameSearch = await Game.find({
      user: req.user.id,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { developer: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } }
      ]
    }).sort({ title: 1 });

    res.json({
      query: search,
      count: gameSearch.length,
      gameSearch
    });
  } catch (error) {
    console.error('Failed searching game:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};