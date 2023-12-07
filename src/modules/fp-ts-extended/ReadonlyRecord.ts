import * as RR from 'fp-ts/ReadonlyRecord';

export * from 'fp-ts/ReadonlyRecord';

export const values: <T>(rr: RR.ReadonlyRecord<string, T>) => ReadonlyArray<T> =
  Object.values;
