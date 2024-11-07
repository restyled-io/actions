import { type NonEmpty } from "./non-empty";
import * as NE from "./non-empty";

export interface HasLineNumber {
  lineNumber: number;
}

export class Hunks<T> {
  private map: Map<number, NonEmpty<T & HasLineNumber>>;
  private lastHunk: number;
  private lastLine: number;

  constructor(lines: (T & HasLineNumber)[]) {
    this.map = new Map();
    this.lastHunk = -99;
    this.lastLine = -99;

    lines.forEach((line) => this.add(line));
  }

  get(lineNumber: number): NonEmpty<T & HasLineNumber> | null {
    return this.map.get(lineNumber) || null;
  }

  forEach(f: (hunk: NonEmpty<T & HasLineNumber>) => void): void {
    this.hunks().forEach(f);
  }

  contain(hunk: NonEmpty<T & HasLineNumber>): boolean {
    return this.hunks().some((x) => {
      return (
        NE.head(hunk).lineNumber >= NE.head(x).lineNumber &&
        NE.last(hunk).lineNumber <= NE.last(x).lineNumber
      );
    });
  }

  private add(line: T & HasLineNumber) {
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

  private hunks(): NonEmpty<T & HasLineNumber>[] {
    return Array.from(this.map.values());
  }
}
