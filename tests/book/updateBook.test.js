// tests/book/updateBook.test.js
import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { updateBook } from "../../controller/book/books/bookController.js";

describe("updateBook Controller", () => {
  let req;
  let res;
  let findOneSpy;
  let saveSpy;

  beforeEach(() => {
    req = {
      params: { id: "12345" },
      body: {
        title: "Updated Title",
        genre: ["Drama"],
        author: "New Author",
        pages: 200,
        status: "Completed",
        rating: 5,
        notes: "Good book",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    findOneSpy = jest.spyOn(Book, "findOne");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should update a book successfully", async () => {
    const mockBook = {
      _id: "12345",
      title: "Old Title",
      save: jest.fn().mockResolvedValue({ _id: "12345", title: "Updated Title" }),
    };

    findOneSpy.mockResolvedValue(mockBook);

    await updateBook(req, res);

    expect(findOneSpy).toHaveBeenCalledWith({ _id: "12345" });
    expect(mockBook.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Book updated successfully",
      book: { _id: "12345", title: "Updated Title" },
    });
  });

  it("should return 404 if book not found", async () => {
    findOneSpy.mockResolvedValue(null);

    await updateBook(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
  });


  it("should set startedAt when status is Reading and not set", async () => {
    const mockBook = {
      _id: "12345",
      status: "Planned",
      save: jest.fn().mockResolvedValue({ _id: "12345", status: "Reading" }),
    };

    findOneSpy.mockResolvedValue(mockBook);

    req.body.status = "Reading";

    await updateBook(req, res);

    expect(mockBook.startedAt).toBeDefined();
    expect(mockBook.save).toHaveBeenCalled();
  });

  it("should handle server errors", async () => {
    findOneSpy.mockRejectedValue(new Error("DB error"));

    await updateBook(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
