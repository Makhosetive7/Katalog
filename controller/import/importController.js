import Book from "../../model/book.js";
import { parseCsv, rowsToObjects } from "../../utils/csvParser.js";
import {
  detectImportFormat,
  mapImportRows,
  buildBookDocument,
} from "../../utils/importMappers.js";

const MAX_IMPORT_ROWS = 2000;

const parseImportCsv = (csvText) => {
  if (!csvText || typeof csvText !== "string") {
    throw new Error("CSV content is required");
  }

  const trimmed = csvText.trim();
  if (!trimmed) throw new Error("CSV file is empty");

  const rows = parseCsv(trimmed);
  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one data row");
  }

  const headers = rows[0];
  const format = detectImportFormat(headers);

  if (format === "unknown") {
    throw new Error(
      "Unrecognized CSV format. Upload a supported library export or a Katalog export file."
    );
  }

  const objects = rowsToObjects(rows);
  if (objects.length > MAX_IMPORT_ROWS) {
    throw new Error(`Import limited to ${MAX_IMPORT_ROWS} books per upload`);
  }

  const mapped = mapImportRows(objects, format);
  return { format, mapped, totalRows: objects.length };
};

export const previewImport = async (req, res) => {
  try {
    const { csv } = req.body;
    const { format, mapped, totalRows } = parseImportCsv(csv);

    const valid = mapped.filter((r) => r.valid);
    const invalid = mapped.filter((r) => !r.valid);

    const statusBreakdown = valid.reduce((acc, row) => {
      const status = row.data.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      format,
      totalRows,
      validCount: valid.length,
      invalidCount: invalid.length,
      statusBreakdown,
      preview: mapped.slice(0, 25).map((row) => ({
        rowNumber: row.rowNumber,
        valid: row.valid,
        issues: row.issues,
        title: row.data?.title,
        author: row.data?.author,
        status: row.data?.status,
        pages: row.data?.pages,
        rating: row.data?.rating,
      })),
      invalidRows: invalid.slice(0, 10).map((row) => ({
        rowNumber: row.rowNumber,
        issues: row.issues,
      })),
    });
  } catch (error) {
    res.status(400).json({ code: "BAD_REQUEST", message: error.message });
  }
};

export const importBooks = async (req, res) => {
  try {
    const userId = req.userId;
    const { csv, skipDuplicates = true } = req.body;
    const { format, mapped } = parseImportCsv(csv);

    const validRows = mapped.filter((r) => r.valid);
    if (validRows.length === 0) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "No valid rows to import",
      });
    }

    const existingBooks = await Book.find({ user: userId }).select("title author isbn");
    const existingKeys = new Set(
      existingBooks.map((b) => {
        if (b.isbn) return `isbn:${b.isbn}`;
        return `title:${b.title?.toLowerCase()}|${b.author?.toLowerCase()}`;
      })
    );

    const toInsert = [];
    let skippedDuplicates = 0;
    let failed = 0;

    for (const row of validRows) {
      const key = row.data.isbn
        ? `isbn:${row.data.isbn}`
        : `title:${row.data.title.toLowerCase()}|${row.data.author.toLowerCase()}`;

      if (skipDuplicates && existingKeys.has(key)) {
        skippedDuplicates++;
        continue;
      }

      try {
        toInsert.push(buildBookDocument(userId, row.data));
        existingKeys.add(key);
      } catch {
        failed++;
      }
    }

    let imported = [];
    if (toInsert.length > 0) {
      imported = await Book.insertMany(toInsert, { ordered: false });
    }

    res.status(201).json({
      message: "Import completed",
      format,
      imported: imported.length,
      skippedDuplicates,
      failed,
      invalidRows: mapped.filter((r) => !r.valid).length,
      statusBreakdown: imported.reduce((acc, book) => {
        acc[book.status] = (acc[book.status] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    if (error.name === "BulkWriteError" && error.insertedDocs) {
      return res.status(201).json({
        message: "Import partially completed",
        imported: error.insertedDocs.length,
        failed: error.writeErrors?.length ?? 0,
      });
    }
    res.status(400).json({ code: "BAD_REQUEST", message: error.message });
  }
};
