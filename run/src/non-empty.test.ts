/* Copyright (C) 2025 Patrick Brisbin
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
