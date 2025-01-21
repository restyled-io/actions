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
import { parsePatches } from "./patch";

describe("parsePatches", () => {
  it("parses multi-patch", () => {
    const patchStr = [
      "From 2f6f88c98fff3afa0289f46bf4eab469f45eebc6 Mon Sep 17 00:00:00 2001",
      "From: A dev <a-dev@users.noreply.github.com>",
      "Date: Sat, 25 Jan 2020 19:21:35 +0200",
      "Subject: [PATCH] JSON stringify string responses",
      "",
      "---",
      " src/events/http/HttpServer.js | 4 +++-",
      " 1 file changed, 3 insertions(+), 1 deletion(-)",
      "",
      "diff --git a/src/events/http/HttpServer.js b/src/events/http/HttpServer.js",
      "index 20bf454..c0fdafb 100644",
      "--- a/src/events/http/HttpServer.js",
      "+++ b/src/events/http/HttpServer.js",
      "@@ -770,7 +770,9 @@ export default class HttpServer {",
      "           override: false,",
      "         })",
      "",
      "-        if (result && typeof result.body !== 'undefined') {",
      "+        if (typeof result === 'string') {",
      "+          response.source = JSON.stringify(result)",
      "+        } else if (result && typeof result.body !== 'undefined') {",
      "           if (result.isBase64Encoded) {",
      "             response.encoding = 'binary'",
      "             response.source = Buffer.from(result.body, 'base64')",
      "--",
      "2.21.1 (Apple Git-122.3)",
      "",
      "",
      "From 0f6f88c98fff3afa0289f46bf4eab469f45eebc6 Mon Sep 17 00:00:00 2001",
      "From: A dev <a-dev@users.noreply.github.com>",
      "Date: Sat, 25 Jan 2020 19:21:35 +0200",
      "Subject: [PATCH] Blah blah",
      "",
      "---",
      "diff --git a/suggestions/src/hunk.ts b/suggestions/src/hunk.ts",
      "new file mode 100644",
      "index 0000000..b295688",
      "--- /dev/null",
      "+++ b/suggestions/src/hunk.ts",
      "@@ -0,0 +1,61 @@",
      '+import { type NonEmpty } from "./non-empty";',
      '+import * as NE from "./non-empty";',
      "+",
      "+export interface HasLineNumber {",
      "+  lineNumber: number;",
      "+}",
      "+",
      "+export class Hunks<T> {",
      "+  private map: Map<number, NonEmpty<T & HasLineNumber>>;",
      "+  private lastHunk: number;",
      "+  private lastLine: number;",
      "+",
      "+  constructor() {",
      "+    this.map = new Map();",
      "+    this.lastHunk = -1;",
      "+    this.lastLine = -1;",
      "+  }",
      "+",
      "+  get(lineNumber: number): NonEmpty<T & HasLineNumber> | null { return this.map.get(lineNumber) || null; }",
      "+",
      "+  add(line: T & HasLineNumber) {",
      "+    const current = this.get(line.lineNumber);",
      "+    const sameLine = line.lineNumber == this.lastLine;",
      "+    const lastLine = line.lineNumber === this.lastLine + 1;",
      "+",
      "+    if (current && (sameLine || lastLine)) {",
      "+      NE.append(current, NE.singleton(line));",
      "+    } else {",
      "+      this.map.set(line.lineNumber, NE.singleton(line));",
      "+      this.lastHunk = line.lineNumber;",
      "+    }",
      "+",
      "+    this.lastLine = line.lineNumber;",
      "+  }",
      "+",
      "+  forEachHunkWithin(",
      "+    other: Hunks<T>,",
      "+    f: (hunk: NonEmpty<T & HasLineNumber>) => void,",
      "+  ): void {",
      "+    Array.from(this.map.values()).forEach((hunk) => {",
      "+      if (other.contains(hunk)) {",
      "+        f(hunk);",
      "+      }",
      "+    });",
      "+  }",
      "+",
      "+  contains(hunk: NonEmpty<T & HasLineNumber>) {",
      "+    return Array.from(this.map.values()).some((x) => {",
      "+      return (",
      "+        hunk.head.lineNumber >= x.head.lineNumber &&",
      "+        hunk.last.lineNumber <= x.last.lineNumber",
      "+      );",
      "+    });",
      "+  }",
      "+}",
      "+",
      "+export function build<T>(lines: (T & HasLineNumber)[]): Hunks<T> {",
      "+  const hunks: Hunks<T> = new Hunks();",
      "+  lines.forEach((line) => hunks.add(line));",
      "+  return hunks;",
      "+}",
    ].join("\n");

    const parsed = parsePatches(patchStr);

    expect(parsed.length).toEqual(2);
    expect(parsed.map((p) => p.hash)).toEqual([
      "2f6f88c98fff3afa0289f46bf4eab469f45eebc6",
      "0f6f88c98fff3afa0289f46bf4eab469f45eebc6",
    ]);
    expect(parsed.map((p) => p.message)).toEqual([
      "[PATCH] JSON stringify string responses",
      "[PATCH] Blah blah",
    ]);
    expect(parsed.flatMap((p) => p.files.map((f) => f.afterName))).toEqual([
      "src/events/http/HttpServer.js",
      "suggestions/src/hunk.ts",
    ]);

    // TODO
    // expect(
    //   parsed.map((p) => {
    //     return p.files.map((f) => {
    //       return f.modifiedLines.map((l) => {
    //         return l.lineNumber;
    //       });
    //     });
    //   }),
    // ).toEqual([[[773].concat(range(773, 3)).concat([777])], [range(1, 61)]]);
  });
});

/* range(5, 3) => [5, 6, 7] */
// function range(begin: number, len: number): number[] {
//   return Array(len)
//     .fill(0)
//     .map((_: number, index: number) => {
//       return index + begin;
//     });
// }
