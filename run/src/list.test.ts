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
import { group, groupBy } from "./list";
import * as NE from "./non-empty";

describe("group", () => {
  it("groups equal elements", () => {
    const actual = group([1, 2, 2, 3, 2, 4, 5, 5, 5, 6]);
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
    const actual = groupBy(
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
