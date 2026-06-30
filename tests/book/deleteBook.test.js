import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { deleteBook } from "../../controller/book/books/bookController.js";

describe("deleteBook Controller", () => {
  let req;
  let res;
  let findByIdSpy;

  beforeEach(() => {
    req = { params: { id: "12345" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    findByIdSpy = jest.spyOn(Book, "findById");
  });

  afterEach(() => jest.restoreAllMocks());

  it("should delete a book by ID", async () => {
    const mockBook = { deleteOne: jest.fn().mockResolvedValue({}) };
    findByIdSpy.mockResolvedValue(mockBook);

    await deleteBook(req, res);

    expect(mockBook.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Book deleted successfully" });
  });

  it("should return 404 if book not found", async () => {
    findByIdSpy.mockResolvedValue(null);
    await deleteBook(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ code: "NOT_FOUND", message: "Book not found" });
  });

  it("should handle server errors", async () => {
    findByIdSpy.mockRejectedValue(new Error("DB error"));
    await deleteBook(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ code: "SERVER_ERROR", message: "Server error" });
  });
});
