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
import { last, group, groupBy } from "./list";

describe("last", () => {
  it("gets the last element of a non-empty array", () => {
    expect(last([1, 2, 3])).toEqual(3);
  });

  it("returns null for an empty array", () => {
    expect(last([])).toBeNull();
  });
});

describe("group", () => {
  it("groups equal elements", () => {
    const actual = group([1, 2, 2, 3, 2, 4, 5, 5, 5, 6]);
    const expected = [[1], [2, 2], [3], [2], [4], [5, 5, 5], [6]];

    expect(actual).toEqual(expected);
  });
});

describe("groupBy", () => {
  it("groups elements by custom comparison", () => {
    const sameFirstLetter = (a: string, b: string): boolean => {
      return a[0] === b[0];
    };
    const actual = groupBy(
      ["apple", "adam", "banana", "bake", "about", "pie"],
      sameFirstLetter,
    );
    const expected = [
      ["apple", "adam"],
      ["banana", "bake"],
      ["about"],
      ["pie"],
    ];

    expect(actual).toEqual(expected);
  });
});
