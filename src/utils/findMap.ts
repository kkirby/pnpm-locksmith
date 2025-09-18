import { purry } from "remeda";

/**
 * Internal implementation of findMap that searches through an array and returns
 * the first truthy result from the mapping function.
 *
 * @param items - Array of items to search through
 * @param fn - Function that maps each item to a result or falsy value
 * @returns The first truthy result or undefined if none found
 */
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

/**
 * Searches through an array and returns the first truthy result from the mapping function.
 * Similar to Array.find() but applies a transformation function first.
 * Supports both direct call and curried usage via remeda's purry.
 *
 * @param items - Array of items to search through
 * @param fn - Function that maps each item to a result or falsy value
 * @returns The first truthy result or undefined if none found
 */
export function findMap<T, R>(
  items: T[],
  fn: (item: T) => R | false | null | undefined
): R | undefined;

/**
 * Curried version of findMap for functional composition.
 *
 * @param fn - Function that maps each item to a result or falsy value
 * @returns A function that takes an array and returns the first truthy result
 */
export function findMap<T, R>(
  fn: (item: T) => R | false | null | undefined
): (items: T[]) => R | undefined;

export function findMap(...args: unknown[]): unknown {
  return purry(_findMap, args);
}
