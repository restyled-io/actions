/* Copyright (C) 2024 Patrick Brisbin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { type Patch, type PatchFile, type PatchLine } from "./parse-git-patch";

import { type Suggestion, getSuggestions } from "./suggestions";

type TestCase = {
  name: string;
  baseDiff: string;
  patches: Patch[];
  suggestions: Suggestion[];
};

function testCase(
  name: string,
  baseDiff: string,
  patches: Patch[],
  suggestions: Suggestion[],
): TestCase {
  return { name, baseDiff, patches, suggestions };
}

function patch(message: string, files: PatchFile[]): Patch {
  return {
    hash: "<some hash>",
    date: "<some date>",
    authorName: "Restyled Test",
    authorEmail: "test@restyled.io",
    message: `[PATCH] ${message}`,
    files,
  };
}

function patchFile(name: string, diff: string): PatchFile {
  const modifiedLines: PatchLine[] = [];

  diff
    .split("\n")
    .filter((x) => x.trim() !== "")
    .forEach((diffLine) => {
      const [rawBeforeLine, rawAfterLine, ...line] = diffLine.split("|");
      const beforeLine = rawBeforeLine.trim();
      const afterLine = rawAfterLine.trim();

      if (beforeLine !== "" && afterLine !== "") {
        // context
        return;
      }

      const modifiedLine: PatchLine =
        beforeLine !== ""
          ? {
              tag: "removed",
              removedLineNumber: parseInt(beforeLine, 10),
              line: line.join("|"),
            }
          : {
              tag: "added",
              addedLineNumber: parseInt(afterLine, 10),
              line: line.join("|"),
            };

      modifiedLines.push(modifiedLine);
    });

  return {
    added: false,
    deleted: false,
    beforeName: name,
    afterName: name,
    modifiedLines,
  };
}

const cases: TestCase[] = [
  testCase(
    "Change on change",
    "<TODO: base diff>",
    [
      patch("Restyled by prettier", [
        patchFile(
          "src/events/http/HttpServer.js",
          `
            775|   |          response.source = JSON.stringify(result)
               |775|          response.source = JSON.stringify(result);
          `,
        ),
      ]),
    ],
    [
      {
        path: "src/events/http/HttpServer.js",
        description: "Restyled by prettier",
        startLine: 775,
        endLine: 775,
        code: ["          response.source = JSON.stringify(result);"],
      },
    ],
  ),
  testCase(
    "Change on addition",
    "<TODO: base diff>",
    [
      patch("Restyled by prettier", [
        patchFile(
          "suggestions/src/hunk.ts",
          `
            18|  |  get(lineNumber: number): NonEmpty<T & HasLineNumber> | null { return this.map.get(lineNumber) || null; }
              |18|  get(lineNumber: number): NonEmpty<T & HasLineNumber> | null {
              |19|    return this.map.get(lineNumber) || null;
              |20|  }
          `,
        ),
      ]),
    ],
    [
      {
        path: "suggestions/src/hunk.ts",
        startLine: 18,
        endLine: 18,
        description: "Restyled by prettier",
        code: [
          "  get(lineNumber: number): NonEmpty<T & HasLineNumber> | null {",
          "    return this.map.get(lineNumber) || null;",
          "  }",
        ],
      },
    ],
  ),
  testCase(
    "Multi-line suggestion",
    "<TODO: base diff>",
    [
      patch("Restyled by fourmolu", [
        patchFile(
          "Foo.hs",
          `
          1|1|
          2| | setRequestBody $
          3| |   encode
           |2| setRequestBody
           |3|   $ encode
          4|4|
          `,
        ),
      ]),
    ],
    [
      {
        path: "Foo.hs",
        startLine: 2,
        endLine: 3,
        description: "Restyled by fourmolu",
        code: [" setRequestBody", "   $ encode"],
      },
    ],
  ),
  testCase(
    "Suggested deletion",
    "<TODO: base diff>",
    [
      patch("Restyled by fourmolu", [
        patchFile(
          "Foo.hs",
          `
          1|1|
          2| | setRequestBody $
          3| |   encode
          4|2|
          `,
        ),
      ]),
    ],
    [
      {
        path: "Foo.hs",
        startLine: 2,
        endLine: 3,
        description: "Restyled by fourmolu",
        code: [],
      },
    ],
  ),
];

describe("getSuggestions", () => {
  test.each(cases)("$name", ({ baseDiff, patches, suggestions }) => {
    const actual = getSuggestions(baseDiff, patches, []).filter((x) => {
      return !x.skipReason;
    });

    expect(actual).toEqual(suggestions);
  });

  test.each(cases)("$name (resolved)", ({ baseDiff, patches, suggestions }) => {
    const includingSkipped = getSuggestions(baseDiff, patches, suggestions);
    const actual = includingSkipped.filter((x) => {
      return !x.skipReason;
    });

    expect(actual).toEqual([]);
    expect(includingSkipped.map((x) => x.skipReason)).toEqual(
      suggestions.map(() => {
        return `previously marked resolved`;
      }),
    );
  });

  it("Multiple suggestions", () => {
    const baseDiff = cases.map((c) => c.baseDiff).join("\n");
    const patches = cases.flatMap((c) => c.patches);
    const suggestions = cases.flatMap((c) => c.suggestions);

    const actual = getSuggestions(baseDiff, patches, []);

    expect(actual.length).toEqual(4);
    expect(actual).toEqual(suggestions);
  });
});
