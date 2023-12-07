import * as O from 'fp-ts/Option';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as Dc from 'io-ts/Decoder';
import * as RA from '../modules/fp-ts-extended/ReadonlyArray';
import * as RR from '../modules/fp-ts-extended/ReadonlyRecord';
import { identity, pipe } from '../modules/fp-ts-extended/function';
import * as md from '../modules/markdown';

export const uniqBy =
  <T>(valFn: (x: T) => string, id: string) =>
  <I, A extends ReadonlyArray<T>>(dc: Dc.Decoder<I, A>) =>
    Dc.parse((xs: A) => {
      return pipe(
        RNEA.fromArray([...xs]),
        O.map(RNEA.groupBy(valFn)),
        O.map(RR.values),
        // treat empty strings as non-equal to support optionals
        O.map(RA.filter((a) => a.length > 1 && valFn(a[0]) !== '')),
        O.chain(RNEA.fromReadonlyArray),
        O.map(RNEA.map(RNEA.map(valFn))),
        O.map((a) => Dc.failure(a, 'unique ' + id)),
        O.getOrElseW(() => Dc.success(xs))
      );
    })(dc);

export const uniqName = uniqBy(
  ({ name }: { name: string }) => name,
  'unique names'
);

export const uniqStrict = uniqBy<string>(identity, '');

export const nonemptyArray = <B>(dc: Dc.Decoder<unknown, B>) =>
  pipe(
    Dc.array(dc),
    Dc.refine((xs): xs is NEA.NonEmptyArray<B> => xs.length > 0, 'nonempty')
  );

const keywordLookup = pipe(
  [
    'and',
    'break',
    'do',
    'else',
    'elseif',
    'end',
    'false',
    'for',
    'function',
    'if',
    'in',
    'local',
    'nil',
    'not',
    'or',
    'repeat',
    'return',
    'then',
    'true',
    'until',
    'while',
  ],
  RA.toRecord(identity)
);

export const nonKeyword = Dc.fromRefinement(
  (str: string): str is string => pipe(keywordLookup, RR.lookup(str), O.isNone),
  'non-keyword'
);

export const expression = pipe(
  Dc.union(
    Dc.boolean,
    pipe(Dc.number, Dc.map(BigInt)),
    Dc.literal('nil'),
    pipe(
      Dc.string,
      Dc.compose(nonKeyword),
      Dc.map((str) => {
        const int = O.tryCatch(() => BigInt(str));
        if (O.isSome(int)) return int.value;
        if (str === 'true') return true;
        if (str === 'false') return false;
        return str;
      })
    )
  )
);

export const regex = (rgx: RegExp, expected: string) =>
  Dc.fromRefinement((str: string): str is string => rgx.test(str), expected);

export const binding = Dc.union(
  pipe(
    Dc.string,
    Dc.compose(regex(/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/, 'lua binding')),
    Dc.compose(nonKeyword)
  ),
  Dc.literal('(Global)')
);

export const bindingOrVariadic = Dc.union(Dc.literal('...'), binding);

export const typename = Dc.union(
  Dc.literal('function'),
  Dc.literal('nil'),
  pipe(
    Dc.string,
    Dc.compose(regex(/^[A-Za-z_]\w*$/, '')),
    Dc.compose(nonKeyword)
  )
);

export const typenameArray = pipe(nonemptyArray(typename), uniqStrict);

export const tagName = Dc.string;

export const tagNameArray = pipe(Dc.array(tagName), uniqStrict);

export const paragraphMarkdown = pipe(
  Dc.string,
  Dc.map(md.parseParagraph),
  Dc.refine(O.isSome, 'a markdown paragraph'),
  Dc.map(({ value }) => value)
);
