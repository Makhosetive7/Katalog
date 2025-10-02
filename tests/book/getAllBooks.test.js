import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { getAllBooks } from "../../controller/book/books/bookController.js";

describe("getAllBooks Controller", () => {
  let req;
  let res;
  let findSpy;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    findSpy = jest.spyOn(Book, "find");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return all books for the user", async () => {
    const mockBooks = [
      { _id: "1", title: "Book 1", user: "user123" },
      { _id: "2", title: "Book 2", user: "user123" },
    ];

    findSpy.mockResolvedValue(mockBooks);

    await getAllBooks(req, res);

    expect(findSpy).toHaveBeenCalledWith({ user: "user123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBooks);
  });

  it("should return 404 if no books found", async () => {
    findSpy.mockResolvedValue([]);

    await getAllBooks(req, res);

    expect(findSpy).toHaveBeenCalledWith({ user: "user123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No books found for this user" });
  });

  it("should handle errors and return 500", async () => {
    findSpy.mockRejectedValue(new Error("DB error"));

    await getAllBooks(req, res);

    expect(findSpy).toHaveBeenCalledWith({ user: "user123" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to retrieve books" });
  });
});
