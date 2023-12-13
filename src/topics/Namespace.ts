import * as O from 'fp-ts/Option';
import * as Rd from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import * as Dc from 'io-ts/Decoder';
import * as BindingInfo from '../info/BindingInfo';
import * as DescInfo from '../info/DescInfo';
import * as TopicInfo from '../info/TopicInfo';
import * as RR from '../modules/fp-ts-extended/ReadonlyRecord';
import { flow, pipe } from '../modules/fp-ts-extended/function';
import * as dc from '../shared/decoders';
import { nameStringOrd } from '../shared/instances';

export type Namespace = {
  readonly doctype: 'namespace';
  readonly tags: ReadonlyArray<string>;
} & DescInfo.DescInfo &
  BindingInfo.BindingInfo &
  TopicInfo.TopicInfo;

export const codec = pipe(
  Dc.struct({ doctype: Dc.literal('namespace') }),
  Dc.intersect(Dc.partial({ tags: dc.tagNameArray })),
  Dc.intersect(DescInfo.codec),
  Dc.intersect(BindingInfo.codec),
  Dc.intersect(TopicInfo.codec)
);

type Raw = Dc.TypeOf<typeof codec>;

export const finalize = (raw: Raw) =>
  flow(
    BindingInfo.finalize(raw),
    (bindingInfo): Namespace => ({
      doctype: raw.doctype,
      tags: raw.tags ?? [],
      ...DescInfo.finalize(raw),
      ...bindingInfo,
      ...TopicInfo.finalize(raw),
    })
  );

export const arrayCodec = pipe(
  Dc.record(codec),
  Dc.map(RR.values),
  dc.uniqName
);

const createAlias =
  (ns: Namespace) =>
  (alias: BindingInfo.Alias): Namespace => ({
    ...ns,
    name: alias.name,
    status: alias.status,
    aliasOf: O.some(ns.name),
    aliases: [],
  });

export const finalizeArray = flow(
  RA.map(finalize),
  Rd.sequenceArray,
  Rd.map(BindingInfo.appendAllAliases(createAlias)),
  Rd.map(RA.sort(nameStringOrd))
);
