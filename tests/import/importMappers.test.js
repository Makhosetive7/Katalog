import { jest } from "@jest/globals";
import {
  detectImportFormat,
  mapImportRows,
} from "../../utils/importMappers.js";
import { parseCsv, rowsToObjects } from "../../utils/csvParser.js";

const EXTERNAL_LIBRARY_SAMPLE = `Book Id,Title,Author,ISBN,ISBN13,My Rating,Number of Pages,Date Read,Date Added,Exclusive Shelf,My Review
1,The Hobbit,J.R.R. Tolkien,9780547928227,9780547928227,5,310,2024/01/15,2023/12/01,read,Great book
2,Dune,Frank Herbert,,9780441172719,0,688,,2024/02/01,to-read,
3,Project Hail Mary,Andy Weir,,9780593135204,4,496,,2024/03/01,currently-reading,`;

describe("csvParser", () => {
  it("parses quoted CSV fields", () => {
    const rows = parseCsv('title,author\n"Hello, World",Jane');
    expect(rows[1][0]).toBe("Hello, World");
    expect(rows[1][1]).toBe("Jane");
  });
});

describe("importMappers", () => {
  it("detects external library format", () => {
    const rows = parseCsv(EXTERNAL_LIBRARY_SAMPLE);
    const format = detectImportFormat(rows[0]);
    expect(format).toBe("external");
  });

  it("maps external library shelves to katalog status", () => {
    const objects = rowsToObjects(parseCsv(EXTERNAL_LIBRARY_SAMPLE));
    const mapped = mapImportRows(objects, "external");

    expect(mapped[0].data.status).toBe("Completed");
    expect(mapped[0].data.completionPercentage).toBe(100);
    expect(mapped[1].data.status).toBe("Planned");
    expect(mapped[2].data.status).toBe("In-Progress");
    expect(mapped.filter((r) => r.valid)).toHaveLength(3);
  });

  it("detects katalog export format", () => {
    const headers = ["title", "author", "status", "currentPage", "completionPercentage"];
    expect(detectImportFormat(headers)).toBe("katalog");
  });
});
