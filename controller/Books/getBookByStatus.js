import Book from "../../model/book.js";

export const getBookByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Want to Read", "Reading", "Completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const bookStatus = await Book.find({ status }).sort({ createdAt: -1 });

    res.status(200).json({
      status,
      count: bookStatus.length, 
      books: bookStatus
    });
  } catch (error) {
    console.error("Failed getting books by status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};