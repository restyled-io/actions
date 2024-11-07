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
