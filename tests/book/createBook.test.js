import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { createBook } from "../../controller/book/books/bookController.js";

describe("createBook Controller", () => {
  let req;
  let res;
  let saveSpy;

  beforeEach(() => {
    req = {
      body: {
        title: "Test Book",
        genre: ["Fiction"],
        author: "John Doe",
        pages: 100,
        chapters: 10,
        status: "Planned",
        rating: 4,
      },
      userId: "user123",
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    saveSpy = jest.spyOn(Book.prototype, "save");
  });

  afterEach(() => jest.restoreAllMocks());

  it("should return 400 if required fields are missing", async () => {
    req.body.title = "";
    await createBook(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      code: "BAD_REQUEST",
      message: "Title and author are required",
    });
  });

  it("should create a book and return 201", async () => {
    saveSpy.mockResolvedValue({ _id: "book123", ...req.body, user: req.userId });
    await createBook(req, res);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Book created successfully",
      book: expect.objectContaining({ title: "Test Book", author: "John Doe" }),
    });
  });

  it("should handle server errors and return 500", async () => {
    saveSpy.mockRejectedValue(new Error("DB error"));
    await createBook(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ code: "SERVER_ERROR", message: "Server error" });
  });
});
