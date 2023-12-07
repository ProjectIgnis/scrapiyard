import * as O from 'fp-ts/Option';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import { pipe } from 'fp-ts/function';

export * from 'fp-ts/ReadonlyNonEmptyArray';

export const takeFirstN =
  (amt: number) =>
  <T>(xs: RNEA.ReadonlyNonEmptyArray<T>) =>
    // as long as amt is positive, the resulting array is guaranteed to be non-empty
    amt < 1
      ? xs
      : (xs.slice(0, amt) as unknown as RNEA.ReadonlyNonEmptyArray<T>);

export const concatSome =
  <T>(o: O.Option<RNEA.ReadonlyNonEmptyArray<T> | ReadonlyArray<T>>) =>
  (rnea: RNEA.ReadonlyNonEmptyArray<T>) =>
    pipe(
      o,
      O.map(
        // spreading an RNEA should mean there's guaranteed to be at least one item
        (xs) => [...rnea, ...xs] as unknown as RNEA.ReadonlyNonEmptyArray<T>
      ),
      O.getOrElse(() => rnea)
    );
