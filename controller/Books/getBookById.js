import Book from "../../model/book.js";

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params; 

    let bookIdentity = await Book.findById(id)

    if (!bookIdentity) {
      return res.status(404).json({ error: "Book not available" })
    }

    res.status(200).json(bookIdentity)
  } catch (error) {
    console.error("Failed fetching book by ID:", error.message)
    res.status(500).json({ error: "Server error" })
  }
};