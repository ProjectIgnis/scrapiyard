import * as Rd from 'fp-ts/Reader';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';

export * from 'fp-ts/Reader';

// Rd.sequenceArray loses RNEA typing, so it needs to be cast back
export const sequenceRNEA = <R, A>(
  xs: RNEA.ReadonlyNonEmptyArray<Rd.Reader<R, A>>
) => Rd.sequenceArray(xs) as Rd.Reader<R, RNEA.ReadonlyNonEmptyArray<A>>;
