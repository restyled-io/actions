import { Hunks } from "./hunk";
import * as NE from "./non-empty";

const ln = (x: number) => {
  return { lineNumber: x };
};

const ne = (x: number, ...xs: number[]) => {
  const ys = xs.map((x) => {
    return ln(x);
  });
  return NE.build(ln(x), ...ys);
};

const hunks = new Hunks([
  ln(1),
  ln(2),
  ln(3),
  ln(7),
  ln(8),
  ln(12),
  ln(13),
  ln(14),
  ln(15),
]);

describe("Hunks", () => {
  describe("get", () => {
    it("gets contiguous hunks of lines by first lineNumber", () => {
      expect(hunks.get(1)).toEqual(ne(1, 2, 3));
      expect(hunks.get(7)).toEqual(ne(7, 8));
      expect(hunks.get(12)).toEqual(ne(12, 13, 14, 15));
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
      const hunk = ne(2, 3);
      expect(hunks.contain(hunk)).toBeTruthy();
    });

    it("returns false if a hunk is not contained any of the hunks", () => {
      const hunk = ne(2, 3, 4);
      expect(hunks.contain(hunk)).toBeFalsy();
    });
  });
});
