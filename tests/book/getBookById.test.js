import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { getBookById } from "../../controller/book/books/bookController.js";

describe("getBookById Controller", () => {
  let req;
  let res;
  let findByIdSpy;

  beforeEach(() => {
    req = {
      params: { id: "1" },
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

  it("should fetch a book by ID", async () => {
    const mockBook = { _id: "1", title: "Book One" };

    findByIdSpy.mockResolvedValue(mockBook);

    await getBookById(req, res);

    expect(findByIdSpy).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBook);
  });

  it("should return 404 if book not found", async () => {
    findByIdSpy.mockResolvedValue(null);

    await getBookById(req, res);

    expect(findByIdSpy).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Book not available" });
  });

  it("should handle errors and return 500", async () => {
    findByIdSpy.mockRejectedValue(new Error("DB error"));

    await getBookById(req, res);

    expect(findByIdSpy).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});
