import * as O from 'fp-ts/Option';
import * as Dc from 'io-ts/Decoder';
import { pipe } from '../modules/fp-ts-extended/function';
import * as md from '../modules/markdown';
import { paragraphMarkdown } from '../shared/decoders';

export type DescInfo = {
  readonly description: md.Paragraph;
  readonly summary: O.Option<md.Paragraph>;
  readonly guide: O.Option<md.Root>;
};

export const codec = pipe(
  Dc.struct({ description: paragraphMarkdown }),
  Dc.intersect(
    Dc.partial({
      summary: paragraphMarkdown,
      guide: Dc.string,
    })
  )
);

export type Raw = Dc.TypeOf<typeof codec>;

export const finalize = (raw: Raw): DescInfo => ({
  description: raw.description,
  summary: O.fromNullable(raw.summary),
  guide: pipe(raw.guide, O.fromNullable, O.map(md.parse)),
});
