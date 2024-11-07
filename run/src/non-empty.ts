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
  return xs.length === 0
    ? null
    : {
        _head: xs[0],
        _tail: xs.slice(1),
      };
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
  return [head(ne)].concat(tail(ne).slice(-1));
}

export function toList<T>(ne: NonEmpty<T>): T[] {
  return [head(ne)].concat(tail(ne));
}
