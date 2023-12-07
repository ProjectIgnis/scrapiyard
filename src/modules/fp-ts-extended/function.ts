import { identity } from 'fp-ts/function';

export * from 'fp-ts/function';

export const memoize =
  <T>(keyFn: (inp: T) => string) =>
  <V>(fn: (inp: T) => V) => {
    const cache: Record<string, V> = {};
    return (inp: T) => {
      const key = keyFn(inp);
      const cached = cache[key];
      if (cached) return cached;
      const output = fn(inp);
      // disable eslint rules to enable object key assignment for memoization
      // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
      cache[key] = output;
      return output;
    };
  };

export const memoizeStringInput = memoize<string>(identity);
