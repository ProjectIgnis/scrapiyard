import * as RA from 'fp-ts/ReadonlyArray';
import * as Dc from 'io-ts/Decoder';
import * as DescInfo from '../info/DescInfo';
import * as TopicInfo from '../info/TopicInfo';
import * as RR from '../modules/fp-ts-extended/ReadonlyRecord';
import { flow, pipe } from '../modules/fp-ts-extended/function';
import * as dc from '../shared/decoders';
import { nameStringOrd } from '../shared/instances';

export type Enum = {
  readonly doctype: 'enum';
  readonly name: string;
  readonly bitmaskInt: boolean;
  readonly tags: ReadonlyArray<string>;
} & DescInfo.DescInfo &
  TopicInfo.TopicInfo;

export const codec = pipe(
  Dc.struct({
    doctype: Dc.literal('enum'),
    name: dc.typename, // enum names follow the same rules as types
  }),
  Dc.intersect(
    Dc.partial({
      bitmaskInt: Dc.boolean,
      tags: dc.tagNameArray,
    })
  ),
  Dc.intersect(DescInfo.codec),
  Dc.intersect(TopicInfo.codec)
);

export type Raw = Dc.TypeOf<typeof codec>;

export const finalize = (raw: Raw) => ({
  doctype: raw.doctype,
  name: raw.name,
  bitmaskInt: raw.bitmaskInt === true,
  tags: raw.tags ?? [],
  ...DescInfo.finalize(raw),
  ...TopicInfo.finalize(raw),
});

export const arrayCodec = pipe(
  Dc.record(codec),
  Dc.map(RR.values),
  dc.uniqName
);

export const finalizeArray = flow(RA.map(finalize), RA.sort(nameStringOrd));
