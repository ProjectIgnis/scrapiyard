import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import type * as md from 'mdast';
import * as RNEA from './fp-ts-extended/ReadonlyNonEmptyArray';
import { memoizeStringInput, pipe } from './fp-ts-extended/function';

export type * from 'mdast';

// esm module workaround
import { awaitSync } from '@kaciras/deasync';
const { fromMarkdown } = awaitSync(import('mdast-util-from-markdown'));
const { gfmFromMarkdown, gfmToMarkdown } = awaitSync(import('mdast-util-gfm'));
const { toMarkdown } = awaitSync(import('mdast-util-to-markdown'));
const { removePosition } = awaitSync(import('unist-util-remove-position'));

// ----------------------------------------------------------------------------
// helper types and functions for immutability
// ----------------------------------------------------------------------------

export type Child<T extends md.Parent> = T['children'][number];
export type Children<T extends md.Parent> = RNEA.ReadonlyNonEmptyArray<
  Child<T>
>;

const normalizeChildren = <T extends md.Parent>(chs: Children<T>) =>
  chs as unknown as Array<Child<T>>;

// ----------------------------------------------------------------------------
// node constructors
// ----------------------------------------------------------------------------

export const text = (value: string): md.Text => ({
  type: 'text',
  value,
});

export const inlineCode = (value: string): md.InlineCode => ({
  type: 'inlineCode',
  value,
});

export const html = (value: string): md.Html => ({
  type: 'html',
  value,
});

export const bold = (children: Children<md.Strong>): md.Strong => ({
  type: 'strong',
  children: normalizeChildren(children),
});

export const italic = (children: Children<md.Emphasis>): md.Emphasis => ({
  type: 'emphasis',
  children: normalizeChildren(children),
});

export const strike = (children: Children<md.Delete>): md.Delete => ({
  type: 'delete',
  children: normalizeChildren(children),
});

export const tableCell = (children: Children<md.TableCell>): md.TableCell => ({
  type: 'tableCell',
  children: normalizeChildren(children),
});

export const tableRow = (children: Children<md.TableRow>): md.TableRow => ({
  type: 'tableRow',
  children: normalizeChildren(children),
});

export const table = (children: Children<md.Table>): md.Table => ({
  type: 'table',
  children: normalizeChildren(children),
});

export const brk: md.Break = { type: 'break' };

export const thematicBreak: md.ThematicBreak = { type: 'thematicBreak' };

export const link = (
  url: string,
  title: O.Option<string>,
  children: Children<md.Link>
): md.Link => ({
  type: 'link',
  children: normalizeChildren(children),
  url,
  title: O.toUndefined(title),
});

// TODO: properly normalize; for now, simply lowercasing works
const asIdentifier = (str: string) => str.toLowerCase();

// only supports 'full' reference type
export const linkReference = (
  label: string,
  children: Children<md.LinkReference>
): md.LinkReference => ({
  type: 'linkReference',
  identifier: asIdentifier(label),
  label,
  referenceType: 'full',
  children: normalizeChildren(children),
});

export const definition = (url: string, label: string): md.Definition => ({
  type: 'definition',
  identifier: asIdentifier(label),
  label,
  url,
  title: null,
});

export const image = (url: string, title?: string, alt?: string): md.Image => ({
  type: 'image',
  url,
  title,
  alt,
});

// only supports 'full' reference type
export const imageReference = (
  label: string,
  alt: string
): md.ImageReference => ({
  type: 'imageReference',
  identifier: asIdentifier(label),
  label,
  referenceType: 'full',
  alt,
});

export const paragraph = (children: Children<md.Paragraph>): md.Paragraph => ({
  type: 'paragraph',
  children: normalizeChildren(children),
});

export type Root = md.Root & { children: Array<md.TopLevelContent> };

export const root = (children: Children<Root>): Root => ({
  type: 'root',
  children: normalizeChildren(children),
});

export const blockquote = (
  children: Children<md.Blockquote>
): md.Blockquote => ({
  type: 'blockquote',
  children: normalizeChildren(children),
});

export const code = (value: string, lang?: string): md.Code => ({
  type: 'code',
  value,
  lang,
});

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6;

export const subdepth = (hdepth: HeadingDepth): HeadingDepth =>
  // the lte check ensures the number will still be a valid HeadingDepth
  hdepth < 6 ? ((hdepth + 1) as HeadingDepth) : 6;

export const heading =
  (depth: HeadingDepth) =>
  (children: Children<md.Heading>): md.Heading => ({
    type: 'heading',
    children: normalizeChildren(children),
    depth,
  });

export const simpleHeading = (hdepth: HeadingDepth) => (content: string) =>
  heading(hdepth)([text(content)]);

export const listItem = (children: Children<md.ListItem>): md.ListItem => ({
  type: 'listItem',
  children: normalizeChildren(children),
});

export const list = (
  ordered: 'ordered' | 'unordered',
  children: Children<md.List>
): md.List => ({
  type: 'list',
  children: normalizeChildren(children),
  ordered: ordered === 'ordered',
});

// ----------------------------------------------------------------------------
// utils
// ----------------------------------------------------------------------------

export const orderedList = (children: Children<md.List>) =>
  list('ordered', children);

export const unorderedList = (children: Children<md.List>) =>
  list('unordered', children);

export const luaCode = (value: string) => code(value, 'lua');

export type Subscript = [md.Html, ...md.PhrasingContent[], md.Html];
export const subscript = (
  children: RNEA.ReadonlyNonEmptyArray<md.PhrasingContent>
): Subscript => [html('<sub>'), ...children, html('</sub>')];

export type Superscript = [md.Html, ...md.PhrasingContent[], md.Html];
export const superscript = (
  children: RNEA.ReadonlyNonEmptyArray<md.PhrasingContent>
): Superscript => [html('<sup>'), ...children, html('</sup>')];

export type AdmonitionType = 'info' | 'tip' | 'warning' | 'danger' | 'details';
export type Admonition = Readonly<
  [md.Paragraph, ...md.BlockContent[], md.Paragraph]
>;
export const admonition = (
  adtype: AdmonitionType,
  children: RNEA.ReadonlyNonEmptyArray<md.BlockContent>,
  title = ''
): Admonition => [
  paragraph([text(`::: ${adtype} ${title}`)]),
  ...children,
  paragraph([text(':::')]),
];

// custom collapsible implementation, since the current
// remark plugin requires every collapsible to have a header
export type Collapsible = Readonly<
  [md.Html, md.Html, ...md.BlockContent[], md.Html]
>;
export const collapsible = (
  summary: string,
  children: RNEA.ReadonlyNonEmptyArray<md.BlockContent>
): Collapsible => [
  html('<details>'),
  html('<summary> ' + summary + '</summary>'),
  ...children,
  html('</details>'),
];

export type Fragment =
  | Root
  | md.TopLevelContent
  | RNEA.ReadonlyNonEmptyArray<Root | md.TopLevelContent>;

const normalizeFragment = (fr: Fragment): ReadonlyArray<md.TopLevelContent> =>
  fr instanceof Array
    ? RA.chain(normalizeFragment)(fr)
    : fr.type === 'root'
    ? fr.children
    : [fr];

const emptyRoot = root([paragraph([text('')])]);

export const combinedFragments = (
  sections: ReadonlyArray<Fragment | O.Option<Fragment>>
): Root =>
  pipe(
    sections,
    RA.filterMap((s) => ('type' in s || s instanceof Array ? O.some(s) : s)),
    RA.chain(normalizeFragment),
    RNEA.fromReadonlyArray,
    O.map(root),
    O.getOrElse(() => emptyRoot)
  );

export const countValueChars = (c: md.RootContent): number =>
  'children' in c
    ? pipe(
        c.children,
        RA.map(countValueChars),
        RA.reduce(0, (a, b) => a + b)
      )
    : 'value' in c
    ? c.value.length
    : 0;

// ----------------------------------------------------------------------------
// parsing and compilation
// ----------------------------------------------------------------------------

export const parse = memoizeStringInput((md) =>
  pipe(
    fromMarkdown(md, 'utf-8', {
      mdastExtensions: [gfmFromMarkdown()],
    }),
    (ast) => {
      // eslint-disable-next-line functional/no-expression-statements
      removePosition(ast, { force: true });
      return ast as Root;
    }
  )
);

export const parseParagraph = memoizeStringInput((lit) =>
  pipe(
    parse(lit),
    O.fromNullable,
    O.map(({ children }) => children),
    O.filter((chs) => chs.length === 1),
    O.flatMap(A.head),
    O.filter((child): child is md.Paragraph => child.type === 'paragraph')
  )
);

export const compile = (rt: Root) =>
  toMarkdown(rt, {
    bulletOther: '+',
    fences: true,
    extensions: [gfmToMarkdown()],
  });
