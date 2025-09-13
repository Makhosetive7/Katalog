import Book from "../../model/book.js";

export const searchBooks = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const bookSearch = await Book.find({
      user: req.user.id,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ]
    }).sort({ title: 1 });

    res.json({
      query: search,
      count: bookSearch.length,
      results: bookSearch
    });
  } catch (error) {
    console.error('Failed searching book:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};