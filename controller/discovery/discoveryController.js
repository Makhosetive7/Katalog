export const searchOpenLibrary = async (req, res) => {
  try {
    const q = req.query.q || req.query.search;
    if (!q || q.length < 2) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Search query must be at least 2 characters",
      });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20);
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}&fields=key,title,author_name,first_publish_year,number_of_pages_median,isbn,cover_i,subject`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({
        code: "UPSTREAM_ERROR",
        message: "Book search service unavailable",
      });
    }

    const data = await response.json();
    const results = (data.docs || []).map((doc) => ({
      openLibraryKey: doc.key,
      title: doc.title,
      author: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : "Unknown",
      publishYear: doc.first_publish_year,
      pages: doc.number_of_pages_median,
      isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : null,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      genres: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : [],
    }));

    res.json({ query: q, count: results.length, results });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
