import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as Dc from 'io-ts/Decoder';
import * as md from '../modules/markdown';
import { paragraphMarkdown } from '../shared/decoders';

// ----------------------------------------------------------------------------
// Suggested Link
// ----------------------------------------------------------------------------

export type SuggestedLink = {
  readonly name: string;
  readonly link: string;
  readonly message: O.Option<md.Paragraph>;
};

const suggestedLinkCodec = Dc.intersect(
  Dc.partial({
    message: paragraphMarkdown,
  })
)(
  Dc.struct({
    name: Dc.string,
    link: Dc.string,
  })
);

const finalizeSuggestedLink = (
  raw: Dc.TypeOf<typeof suggestedLinkCodec>
): SuggestedLink => ({
  name: raw.name,
  link: raw.link,
  message: O.fromNullable(raw.message),
});

// ----------------------------------------------------------------------------
// Topic Info
// ----------------------------------------------------------------------------

export type TopicInfo = {
  readonly filepath: O.Option<string>;
  readonly suggestedLinks: ReadonlyArray<SuggestedLink>;
};

export const codec = Dc.partial({
  filepath: Dc.string,
  suggestedLinks: Dc.array(suggestedLinkCodec),
});

export type Raw = Dc.TypeOf<typeof codec>;

export const finalize = (raw: Raw): TopicInfo => ({
  filepath: O.fromNullable(raw.filepath),
  suggestedLinks: RA.map(finalizeSuggestedLink)(raw.suggestedLinks ?? []),
});
