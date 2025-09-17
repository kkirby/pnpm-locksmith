import { purry } from "remeda";

function _findMap<T, R>(
  items: T[],
  fn: (item: T) => R | false | null | undefined
): R | undefined {
  for (const item of items) {
    const result = fn(item);
    if (result !== false && result !== null && result !== undefined)
      return result;
  }
  return undefined;
}

export function findMap<T, R>(
  items: T[],
  fn: (item: T) => R | false | null | undefined
): R | undefined;
export function findMap<T, R>(
  fn: (item: T) => R | false | null | undefined
): (items: T[]) => R | undefined;

export function findMap(...args: unknown[]): unknown {
  return purry(_findMap, args);
}
