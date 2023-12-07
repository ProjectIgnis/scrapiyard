import * as Monoid from 'fp-ts/Monoid';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import { flow } from 'fp-ts/function';
import * as S from 'fp-ts/string';

export * from 'fp-ts/string';

export const clamped = (pre: string, post: string) => (str: string) =>
  pre + str + post;

export const parenthesized = clamped('(', ')');

export const bracketed = clamped('[', ']');

export const braced = clamped('{', '}');

export const surrounded = (by: string) => clamped(by, by);

export const doubleQuoted = surrounded('"');

export const singlequoted = surrounded("'");

export const concatAll = Monoid.concatAll(S.Monoid);

export const intercalate = RA.intercalate(S.Monoid);

export const sentenceCase = flow(
  S.split(''),
  RNEA.unprepend,
  ([fst, rest]) => S.toUpperCase(fst) + concatAll(rest)
);

export const append = (post: string) => (str: string) => str + post;

export const prepend = (pre: string) => (str: string) => pre + str;
