import * as O from 'fp-ts/Option';
import * as Ord from 'fp-ts/Ord';
import * as Rd from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import * as Dc from 'io-ts/Decoder';
import * as BindingInfo from '../info/BindingInfo';
import * as DescInfo from '../info/DescInfo';
import * as TopicInfo from '../info/TopicInfo';
import * as RR from '../modules/fp-ts-extended/ReadonlyRecord';
import { flow, pipe } from '../modules/fp-ts-extended/function';
import * as S from '../modules/fp-ts-extended/string';
import * as dc from '../shared/decoders';

export type Constant = {
  readonly doctype: 'constant';
  readonly value: string | bigint | boolean;
  readonly namespace: O.Option<string>;
  readonly partialName: string;
  readonly enum: string;
  readonly tags: ReadonlyArray<string>;
} & DescInfo.DescInfo &
  TopicInfo.TopicInfo &
  BindingInfo.BindingInfo;

export const codec = pipe(
  Dc.struct({
    doctype: Dc.literal('constant'),
    value: dc.expression,
    enum: dc.binding,
  }),
  Dc.intersect(
    Dc.partial({
      namespace: dc.binding,
      tags: dc.tagNameArray,
    })
  ),
  Dc.intersect(DescInfo.codec),
  Dc.intersect(BindingInfo.codec),
  Dc.intersect(TopicInfo.codec),
  Dc.map((r) => ({
    ...r,
    partialName: r.name,
    name: r.namespace ? r.namespace + '.' + r.name : r.name,
  }))
);

export type Raw = Dc.TypeOf<typeof codec>;

export const finalize = (raw: Raw) =>
  flow(
    BindingInfo.finalize(raw),
    (bindingInfo): Constant => ({
      doctype: raw.doctype,
      value: raw.value,
      enum: raw.enum,
      namespace: O.fromNullable(raw.namespace),
      partialName: raw.partialName,
      tags: raw.tags ?? [],
      ...TopicInfo.finalize(raw),
      ...DescInfo.finalize(raw),
      ...bindingInfo,
    })
  );

export const arrayCodec = pipe(
  Dc.record(codec),
  Dc.map(RR.values),
  dc.uniqName
);

const typeOrder: RR.ReadonlyRecord<string, number> = {
  boolean: 1,
  bigint: 2,
  string: 3,
};

const ord: Ord.Ord<Constant> = {
  equals: (fst, snd) => fst.name === snd.name,
  compare: (a, b) => {
    if (a.enum !== b.enum) return S.Ord.compare(a.enum, b.enum);
    if (a.value === b.value) return 0;

    // hardcoded for sorting archetypes
    // sort by value, unless they have the same superarchetype
    if (
      a.enum === 'Archetype' &&
      typeof a.value === 'bigint' &&
      typeof b.value === 'bigint' &&
      (a.value & 0xfffn) === (b.value & 0xfffn)
    )
      return (a.value & 0xf000n) < (b.value & 0xf000n) ? -1 : 1;

    const type1 = typeof a.value;
    const type2 = typeof b.value;
    if (type1 === type2) return a.value < b.value ? -1 : 1;
    return (typeOrder[type1] ?? 0) < (typeOrder[type2] ?? 0) ? -1 : 1;
  },
};

const createAlias =
  (ct: Constant) =>
  (alias: BindingInfo.Alias): Constant => {
    const [namespace, partialName] = alias.name.split('.');
    return {
      ...ct,
      name: alias.name,
      namespace: partialName ? O.fromNullable(namespace) : O.none,
      partialName: partialName ?? alias.name,
      status: alias.status,
      aliasOf: O.some(ct.name),
      aliases: [],
    };
  };

export const finalizeArray = flow(
  RA.map(finalize),
  Rd.sequenceArray,
  Rd.map(BindingInfo.appendAllAliases(createAlias)),
  Rd.map(RA.sort(ord))
);
