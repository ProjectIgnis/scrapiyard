import * as RA from 'fp-ts/ReadonlyArray';
import * as Dc from 'io-ts/Decoder';
import * as DescInfo from '../info/DescInfo';
import * as TopicInfo from '../info/TopicInfo';
import * as RR from '../modules/fp-ts-extended/ReadonlyRecord';
import { flow, pipe } from '../modules/fp-ts-extended/function';
import { uniqName } from '../shared/decoders';
import { nameStringOrd } from '../shared/instances';

export type Tag = {
  readonly doctype: 'tag';
  readonly name: string;
} & DescInfo.DescInfo &
  TopicInfo.TopicInfo;

const codec = pipe(
  Dc.struct({
    doctype: Dc.literal('tag'),
    name: Dc.string,
  }),
  Dc.intersect(DescInfo.codec),
  Dc.intersect(TopicInfo.codec)
);

export type Raw = Dc.TypeOf<typeof codec>;

const finalize = (raw: Raw): Tag => ({
  doctype: raw.doctype,
  name: raw.name,
  ...DescInfo.finalize(raw),
  ...TopicInfo.finalize(raw),
});

export const arrayCodec = pipe(Dc.record(codec), Dc.map(RR.values), uniqName);

export const finalizeArray = flow(RA.map(finalize), RA.sort(nameStringOrd));
