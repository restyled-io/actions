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
export type NonEmpty<T> = {
  readonly _head: T;
  readonly _tail: T[];
};

export function build<T>(x: T, ...xs: T[]) {
  return {
    _head: x,
    _tail: xs,
  };
}

export function nonEmpty<T>(xs: T[]): NonEmpty<T> | null {
  return xs.length === 0 ? null : build(xs[0], ...xs.slice(1));
}

export function append<T>(a: NonEmpty<T>, b: NonEmpty<T>): NonEmpty<T> {
  return {
    _head: head(a),
    _tail: tail(a).concat(toList(b)),
  };
}

export function singleton<T>(t: T): NonEmpty<T> {
  return {
    _head: t,
    _tail: [],
  };
}

export function head<T>(ne: NonEmpty<T>): T {
  return ne._head;
}

export function tail<T>(ne: NonEmpty<T>): T[] {
  return ne._tail;
}

export function last<T>(ne: NonEmpty<T>): T {
  const t = ne._tail;

  return t.length == 0 ? head(ne) : t.slice(-1)[0];
}

export function init<T>(ne: NonEmpty<T>): T[] {
  const t = ne._tail;
  const l = t.length;

  return l === 0 ? [] : [head(ne)].concat(t.slice(0, l - 1));
}

export function toList<T>(ne: NonEmpty<T>): T[] {
  return [head(ne)].concat(tail(ne));
}
