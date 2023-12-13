import * as O from 'fp-ts/Option';
import * as Rd from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import * as Dc from 'io-ts/Decoder';
import * as BindingInfo from '../info/BindingInfo';
import * as DescInfo from '../info/DescInfo';
import * as SignatureInfo from '../info/SignatureInfo';
import * as TopicInfo from '../info/TopicInfo';
import * as RR from '../modules/fp-ts-extended/ReadonlyRecord';
import { flow, pipe } from '../modules/fp-ts-extended/function';
import * as dc from '../shared/decoders';
import { nameStringOrd } from '../shared/instances';

// avoid clashing with the standard js 'Function' type just for this file
type Function_ = {
  readonly doctype: 'function';
  readonly namespace: O.Option<string>;
  readonly partialName: string;
  readonly tags: ReadonlyArray<string>;
} & SignatureInfo.SignatureInfo &
  DescInfo.DescInfo &
  BindingInfo.BindingInfo &
  TopicInfo.TopicInfo;

export type Function = Function_;

export const codec = pipe(
  Dc.struct({
    doctype: Dc.literal('function'),
  }),
  Dc.intersect(
    Dc.partial({
      namespace: dc.binding,
      tags: dc.tagNameArray,
    })
  ),
  Dc.intersect(SignatureInfo.codec),
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
    (bindingInfo): Function_ => ({
      doctype: raw.doctype,
      namespace: O.fromNullable(raw.namespace),
      partialName: raw.partialName,
      tags: raw.tags ?? [],
      ...SignatureInfo.finalize(raw),
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

const createAlias =
  (fn: Function_) =>
  (alias: BindingInfo.Alias): Function_ => {
    const [namespace, partialName] = alias.name.split('.');
    return {
      ...fn,
      name: alias.name,
      namespace: partialName ? O.fromNullable(namespace) : O.none,
      partialName: partialName ?? alias.name,
      status: alias.status,
      aliasOf: O.some(fn.name),
      aliases: [],
    };
  };

export const finalizeArray = flow(
  RA.map(finalize),
  Rd.sequenceArray,
  Rd.map(BindingInfo.appendAllAliases(createAlias)),
  Rd.map(RA.sort(nameStringOrd))
);
