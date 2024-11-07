import { Hunks } from "./hunk";
import * as NE from "./non-empty";

const hunkLine = (x: number) => {
  return { lineNumber: x };
};

const hunk = (x: number, ...xs: number[]) => {
  const ys = xs.map((x) => {
    return hunkLine(x);
  });
  return NE.build(hunkLine(x), ...ys);
};

const hunks = new Hunks([
  hunkLine(1),
  hunkLine(2),
  hunkLine(3),
  hunkLine(7),
  hunkLine(8),
  hunkLine(12),
  hunkLine(13),
  hunkLine(14),
  hunkLine(15),
]);

describe("Hunks", () => {
  describe("get", () => {
    it("gets contiguous hunks of lines by first lineNumber", () => {
      expect(hunks.get(1)).toEqual(hunk(1, 2, 3));
      expect(hunks.get(7)).toEqual(hunk(7, 8));
      expect(hunks.get(12)).toEqual(hunk(12, 13, 14, 15));
    });

    it("returns null for non-first-line lookups", () => {
      expect(hunks.get(-1)).toBeNull();
      expect(hunks.get(0)).toBeNull();
      expect(hunks.get(2)).toBeNull();
      expect(hunks.get(3)).toBeNull();
      expect(hunks.get(4)).toBeNull();
      expect(hunks.get(5)).toBeNull();
      expect(hunks.get(6)).toBeNull();
      expect(hunks.get(9)).toBeNull();
      expect(hunks.get(10)).toBeNull();
      expect(hunks.get(11)).toBeNull();
      expect(hunks.get(16)).toBeNull();
    });
  });

  describe("contain", () => {
    it("returns true if a hunk is wholly contained in any of the hunks", () => {
      expect(hunks.contain(hunk(2, 3))).toBeTruthy();
    });

    it("returns false if a hunk is not contained any of the hunks", () => {
      expect(hunks.contain(hunk(2, 3, 4))).toBeFalsy();
    });
  });
});
