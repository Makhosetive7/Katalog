import { jest } from "@jest/globals";
import Book from "../../model/book.js";
import { getAllBooks } from "../../controller/book/books/bookController.js";

describe("getAllBooks Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      userId: "user123",
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return paginated books for the user", async () => {
    const mockBooks = [
      { _id: "1", title: "Book 1", user: "user123" },
      { _id: "2", title: "Book 2", user: "user123" },
    ];

    jest.spyOn(Book, "find").mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockBooks),
        }),
      }),
    });
    jest.spyOn(Book, "countDocuments").mockResolvedValue(2);

    await getAllBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      items: mockBooks,
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasMore: false,
      },
    });
  });

  it("should return empty paginated list if no books found", async () => {
    jest.spyOn(Book, "find").mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
    jest.spyOn(Book, "countDocuments").mockResolvedValue(0);

    await getAllBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      items: [],
      pagination: expect.objectContaining({ total: 0 }),
    });
  });

  it("should handle errors and return 500", async () => {
    jest.spyOn(Book, "find").mockImplementation(() => {
      throw new Error("DB error");
    });

    await getAllBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: "SERVER_ERROR",
      message: "Failed to retrieve books",
    });
  });
});
