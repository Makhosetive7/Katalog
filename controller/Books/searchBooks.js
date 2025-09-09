import Book from "../../model/book.js";

export const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const bookSearch = await Book.find({
      user: req.user.id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } }
      ]
    }).sort({ title: 1 });

    res.json({
      query: q,
      count: bookSearch.length,
      bookSearch
    });
  } catch (error) {
    console.error('Failed searching book:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};