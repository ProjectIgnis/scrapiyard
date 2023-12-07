import * as RA from 'fp-ts/ReadonlyArray';
import * as RR from 'fp-ts/ReadonlyRecord';
import { flow } from 'fp-ts/function';

export * from 'fp-ts/ReadonlyArray';

export const toRecord = <T>(keyFn: (x: T) => string) =>
  flow(
    RA.map((x: T) => [keyFn(x), x] as const),
    RR.fromEntries
  );
