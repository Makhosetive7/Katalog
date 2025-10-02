// tests/book/searchBooks.test.js
import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { searchBooks } from "../../controller/book/books/bookController.js";

describe("searchBooks Controller", () => {
  let req;
  let res;
  let findSpy;

  beforeEach(() => {
    req = {
      query: { search: "te" },
      user: { id: "user123" }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    findSpy = jest.spyOn(Book, "find");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 400 if search query is missing or too short", async () => {
    req.query.search = "a"; 
    await searchBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Search query must be at least 2 characters long",
    });
  });

  it("should return results if books are found", async () => {
    const mockBooks = [
      { _id: "1", title: "Test Book", author: "John", genre: ["Fiction"] },
    ];

    // Mock Book.find().sort()
    findSpy.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockBooks),
    });

    await searchBooks(req, res);

    expect(findSpy).toHaveBeenCalledWith({
      user: "user123",
      $or: [
        { title: { $regex: "te", $options: "i" } },
        { author: { $regex: "te", $options: "i" } },
        { genre: { $regex: "te", $options: "i" } },
      ],
    });

    expect(res.json).toHaveBeenCalledWith({
      query: "te",
      count: mockBooks.length,
      results: mockBooks,
    });
  });

  it("should return empty results if no books match", async () => {
    findSpy.mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });

    await searchBooks(req, res);

    expect(res.json).toHaveBeenCalledWith({
      query: "te",
      count: 0,
      results: [],
    });
  });

  it("should handle server errors", async () => {
    findSpy.mockImplementation(() => {
      throw new Error("DB error");
    });

    await searchBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
