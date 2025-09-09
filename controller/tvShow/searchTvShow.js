import TvShow from "../../model/tvShow.js";

export const searchTvShows = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const showSearch = await TvShow.find({
      user: req.user.id,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ]
    }).sort({ title: 1 });

    res.json({
      query: search,
      count: showSearch.length,
      showSearch
    });
  } catch (error) {
    console.error('Failed searching TvShow:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};