import Book from "../../../model/book.js";

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find(); 
    res.json(books);
  } catch (error) {
    console.log("Failed getting all books")
    res.status(500).json({ error: error.message });
  }
};