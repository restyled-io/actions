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
import { NonEmpty, nonEmpty } from "./non-empty";
import * as NE from "./non-empty";

export function group<T>(xs: T[]): NonEmpty<T>[] {
  return groupBy(xs, (a, b) => a === b);
}

export function groupBy<T>(
  xs: T[],
  isEqual: (a: T, b: T) => boolean,
): NonEmpty<T>[] {
  const go = (acc: NonEmpty<T>[], x: T): NonEmpty<T>[] => {
    const neAcc = nonEmpty(acc);

    if (!neAcc) {
      // empty accumulator, start first group
      return [NE.singleton(x)];
    }

    const init = NE.init(neAcc);
    const prevGroup = NE.last(neAcc);
    const prevElem = NE.last(prevGroup);
    const updated = isEqual(prevElem, x)
      ? [NE.append(prevGroup, NE.singleton(x))]
      : [prevGroup, NE.singleton(x)];

    return init.concat(updated);
  };

  return xs.reduce(go, []);
}
