import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RR from 'fp-ts/ReadonlyRecord';
import * as Dc from 'io-ts/Decoder';
import { pipe } from '../modules/fp-ts-extended/function';
import * as md from '../modules/markdown';
import * as dc from '../shared/decoders';

// ----------------------------------------------------------------------------
// Status
// ----------------------------------------------------------------------------

export type Status = {
  readonly index: 'stable' | 'unstable' | 'deprecated' | 'deleted';
  readonly since: O.Option<string>;
  readonly message: O.Option<md.Paragraph>;
};

const statusIndexCodec = Dc.union(
  Dc.literal('stable'),
  Dc.literal('unstable'),
  Dc.literal('deprecated'),
  Dc.literal('deleted')
);

const statusCodec = pipe(
  Dc.struct({ index: statusIndexCodec }),
  Dc.intersect(
    Dc.partial({
      since: Dc.string,
      message: pipe(dc.maxChar(80), Dc.compose(dc.paragraphMarkdown)),
    })
  )
);

const finalizeStatus = (raw: Dc.TypeOf<typeof statusCodec>): Status => ({
  index: raw.index,
  since: O.fromNullable(raw.since),
  message: O.fromNullable(raw.message),
});

// ----------------------------------------------------------------------------
// Alias
// ----------------------------------------------------------------------------

export type Alias = {
  readonly name: string;
  readonly status: Status;
};

const aliasCodec = Dc.struct({
  name: dc.binding,
  status: statusCodec,
});

const aliasArrayCodec = pipe(Dc.array(aliasCodec), dc.uniqName);

const finalizeAlias = (raw: Dc.TypeOf<typeof aliasCodec>): Alias => ({
  name: raw.name,
  status: finalizeStatus(raw.status),
});

// ----------------------------------------------------------------------------
// BindingInfo
// ----------------------------------------------------------------------------

export type BindingInfo = {
  readonly name: string;
  readonly status: Status;
  readonly aliases: ReadonlyArray<Alias>;
  readonly aliasOf: O.Option<string>;
  readonly source: O.Option<string>;
};

export type SourceRecord = RR.ReadonlyRecord<string, string>;

export const codec = pipe(
  Dc.struct({ name: dc.binding, status: statusCodec }),
  Dc.intersect(Dc.partial({ aliases: aliasArrayCodec }))
);

export type Raw = Dc.TypeOf<typeof codec>;

export const finalize =
  (raw: Raw) =>
  (sr: SourceRecord): BindingInfo => ({
    name: raw.name,
    status: finalizeStatus(raw.status),
    aliases: RA.map(finalizeAlias)(raw.aliases ?? []),
    aliasOf: O.none,
    source: O.fromNullable(sr[raw.name]),
  });

export const appendAllAliases =
  <T extends BindingInfo>(aliasFn: (main: T) => (alias: Alias) => T) =>
  (xs: ReadonlyArray<T>): ReadonlyArray<T> =>
    [...xs, ...RA.chain((main: T) => RA.map(aliasFn(main))(main.aliases))(xs)];
