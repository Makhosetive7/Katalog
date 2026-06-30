// tests/book/updateBook.test.js
import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { updateBook } from "../../controller/book/books/bookController.js";

describe("updateBook Controller", () => {
  let req;
  let res;
  let findByIdSpy;

  beforeEach(() => {
    req = {
      params: { id: "12345" },
      userId: "user123",
      body: {
        title: "Updated Title",
        genre: ["Drama"],
        author: "New Author",
        pages: 200,
        status: "In-Progress",
        rating: 5,
        notes: "Good book",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    findByIdSpy = jest.spyOn(Book, "findById");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should update a book successfully", async () => {
    const mockBook = {
      _id: "12345",
      title: "Old Title",
      status: "In-Progress",
      timeline: {},
      save: jest.fn().mockResolvedValue({ _id: "12345", title: "Updated Title" }),
    };

    findByIdSpy.mockResolvedValue(mockBook);

    await updateBook(req, res);

    expect(mockBook.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Book updated successfully",
      book: { _id: "12345", title: "Updated Title" },
    });
  });

  it("should return 404 if book not found", async () => {
    findByIdSpy.mockResolvedValue(null);

    await updateBook(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ code: "NOT_FOUND", message: "Book not found" });
  });

  it("should set timeline.startedAt when status is In-Progress", async () => {
    const mockBook = {
      _id: "12345",
      status: "Planned",
      timeline: {},
      save: jest.fn().mockResolvedValue({ _id: "12345", status: "In-Progress" }),
    };

    findByIdSpy.mockResolvedValue(mockBook);
    req.body.status = "In-Progress";

    await updateBook(req, res);

    expect(mockBook.timeline.startedAt).toBeDefined();
    expect(mockBook.save).toHaveBeenCalled();
  });

  it("should handle server errors", async () => {
    findByIdSpy.mockRejectedValue(new Error("DB error"));

    await updateBook(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ code: "SERVER_ERROR", message: "Server error" });
  });
});
