import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { deleteBook } from "../../controller/book/books/bookController.js";

describe("deleteBook Controller", () => {
  let req;
  let res;
  let findByIdAndDeleteSpy;

  beforeEach(() => {
    req = {
      params: {
        id: "12345",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    findByIdAndDeleteSpy = jest.spyOn(Book, "findByIdAndDelete");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should delete a book by ID", async () => {
    findByIdAndDeleteSpy.mockResolvedValue({ _id: "12345" });

    await deleteBook(req, res);

    expect(findByIdAndDeleteSpy).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Book deleted successfully" });
  });

  it("should return 404 if book not found", async () => {
    findByIdAndDeleteSpy.mockResolvedValue(null);

    await deleteBook(req, res);

    expect(findByIdAndDeleteSpy).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
  });

  it("should handle server errors", async () => {
    findByIdAndDeleteSpy.mockRejectedValue(new Error("DB error"));

    await deleteBook(req, res);

    expect(findByIdAndDeleteSpy).toHaveBeenCalledWith("12345");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
