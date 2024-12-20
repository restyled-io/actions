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
import { type NonEmpty } from "./non-empty";
import * as NE from "./non-empty";

export interface HasLineNumber {
  lineNumber: number;
}

export type HunkLine<T> = T & HasLineNumber;

export type Hunk<T> = NonEmpty<HunkLine<T>>;

export class Hunks<T> {
  private map: Map<number, Hunk<T>>;
  private lastHunk: number;
  private lastLine: number;

  constructor(lines: HunkLine<T>[]) {
    this.map = new Map();
    this.lastHunk = -99;
    this.lastLine = -99;

    lines.forEach((line) => this.add(line));
  }

  get(lineNumber: number): Hunk<T> | null {
    return this.map.get(lineNumber) || null;
  }

  forEach(f: (hunk: Hunk<T>) => void): void {
    this.hunks().forEach(f);
  }

  contain(hunk: Hunk<T>): boolean {
    return this.hunks().some((x) => {
      return (
        NE.head(hunk).lineNumber >= NE.head(x).lineNumber &&
        NE.last(hunk).lineNumber <= NE.last(x).lineNumber
      );
    });
  }

  lines(): number[] {
    return this.hunks().flatMap((hunk) => {
      return NE.toList(hunk).map((x) => x.lineNumber);
    });
  }

  private add(line: HunkLine<T>) {
    const current = this.get(this.lastHunk);
    const isSameLine = line.lineNumber === this.lastLine;
    const isNextLine = line.lineNumber === this.lastLine + 1;

    if (current && (isSameLine || isNextLine)) {
      const updated = NE.append(current, NE.singleton(line));
      this.map.set(this.lastHunk, updated);
    } else {
      this.map.set(line.lineNumber, NE.singleton(line));
      this.lastHunk = line.lineNumber;
    }

    this.lastLine = line.lineNumber;
  }

  private hunks(): Hunk<T>[] {
    return Array.from(this.map.values());
  }
}
