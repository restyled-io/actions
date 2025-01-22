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

  describe("init", () => {
    it("returns all but the last element", () => {
      const ne = NE.build(1, 2, 3);

      expect(NE.init(ne)).toEqual([1, 2]);
    });

    it("returns empty for singleton list", () => {
      const ne = NE.singleton(1);

      expect(NE.init(ne)).toEqual([]);
    });
  });
});

describe("group", () => {
  it("groups equal elements", () => {
    const actual = NE.group([1, 2, 2, 3, 2, 4, 5, 5, 5, 6]);
    const expected = [
      NE.build(1),
      NE.build(2, 2),
      NE.build(3),
      NE.build(2),
      NE.build(4),
      NE.build(5, 5, 5),
      NE.build(6),
    ];

    expect(actual).toEqual(expected);
  });
});

describe("groupBy", () => {
  it("groups elements by custom comparison", () => {
    const sameFirstLetter = (a: string, b: string): boolean => {
      return a[0] === b[0];
    };
    const actual = NE.groupBy(
      ["apple", "adam", "banana", "bake", "about", "pie"],
      sameFirstLetter,
    );
    const expected = [
      NE.build("apple", "adam"),
      NE.build("banana", "bake"),
      NE.build("about"),
      NE.build("pie"),
    ];

    expect(actual).toEqual(expected);
  });
});
