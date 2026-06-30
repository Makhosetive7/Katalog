import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { searchBooks } from "../../controller/book/books/bookController.js";

describe("searchBooks Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { query: { search: "te" }, userId: "user123" };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => jest.restoreAllMocks());

  it("should return 400 if search query is missing or too short", async () => {
    req.query.search = "a";
    await searchBooks(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      code: "BAD_REQUEST",
      message: "Search query must be at least 2 characters long",
    });
  });

  it("should return paginated results if books are found", async () => {
    const mockBooks = [{ _id: "1", title: "Test Book", author: "John", genre: ["Fiction"] }];
    jest.spyOn(Book, "find").mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockBooks),
        }),
      }),
    });
    jest.spyOn(Book, "countDocuments").mockResolvedValue(1);

    await searchBooks(req, res);

    expect(res.json).toHaveBeenCalledWith({
      query: "te",
      items: mockBooks,
      pagination: expect.objectContaining({ total: 1 }),
    });
  });

  it("should handle server errors", async () => {
    jest.spyOn(Book, "find").mockImplementation(() => {
      throw new Error("DB error");
    });
    await searchBooks(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ code: "SERVER_ERROR", message: "Server error" });
  });
});
