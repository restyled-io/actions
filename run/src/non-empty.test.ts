import { nonEmpty } from "./non-empty";
import * as NE from "./non-empty";

describe("NonEmpty", () => {
  describe("nonEmpty", () => {
    it("returns if given a non-empty list", () => {
      const ne = nonEmpty([1, 2, 3]);

      expect(ne).not.toBeNull();
    });

    it("returns null given an empty list", () => {
      const ne = nonEmpty([]);

      expect(ne).toBeNull();
    });

    it("maintains the list as-is", () => {
      const xs = [1, 2, 3];
      const ne = { _head: xs[0], _tail: xs.slice(1) };

      expect(NE.toList(ne)).toEqual(xs);
    });
  });

  describe("append", () => {
    it("appends two NonEmpty values into a new one", () => {
      const xs = { _head: 1, _tail: [2, 3] };
      const ys = { _head: 4, _tail: [5, 6] };

      expect(NE.toList(NE.append(xs, ys))).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("singleton", () => {
    it("creates a NonEmpty of one element safely", () => {
      const ne = NE.singleton(1);

      expect(NE.toList(ne)).toEqual([1]);
    });
  });
});
