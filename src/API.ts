import * as E from 'fp-ts/Either';
import * as Rd from 'fp-ts/Reader';
import * as RE from 'fp-ts/ReaderEither';
import * as RR from 'fp-ts/ReadonlyRecord';
import { constant, flow, identity, pipe } from 'fp-ts/lib/function';
import * as Dc from 'io-ts/Decoder';
import yaml from 'js-yaml';
import * as FS from './FileSystem';
import { SourceRecord } from './info/BindingInfo';
import * as RA from './modules/fp-ts-extended/ReadonlyArray';
import * as RNEA from './modules/fp-ts-extended/ReadonlyNonEmptyArray';
import * as Constant from './topics/Constant';
import * as Enum from './topics/Enum';
import * as Function from './topics/Function';
import * as Namespace from './topics/Namespace';
import * as Tag from './topics/Tag';
import * as Type from './topics/Type';

// ----------------------------------------------------------------------------
// types and codec
// ----------------------------------------------------------------------------

export type Topic =
  | Constant.Constant
  | Enum.Enum
  | Function.Function
  | Namespace.Namespace
  | Tag.Tag
  | Type.Type;

export type DocType = Topic['doctype'];

export type APIGroup<T extends Topic> = {
  readonly array: ReadonlyArray<T>;
  readonly record: RR.ReadonlyRecord<string, T>;
};

const apiGroup = <T extends Topic>(array: ReadonlyArray<T>) =>
  pipe(
    array,
    RA.toRecord(({ name }) => name),
    (record) => ({ array, record })
  );

export type API = {
  readonly constants: APIGroup<Constant.Constant>;
  readonly enums: APIGroup<Enum.Enum>;
  readonly functions: APIGroup<Function.Function>;
  readonly namespaces: APIGroup<Namespace.Namespace>;
  readonly tags: APIGroup<Tag.Tag>;
  readonly types: APIGroup<Type.Type>;
};

const codec = Dc.partial({
  function: Function.arrayCodec,
  namespace: Namespace.arrayCodec,
  constant: Constant.arrayCodec,
  enum: Enum.arrayCodec,
  type: Type.arrayCodec,
  tag: Tag.arrayCodec,
});

export const finalize = (
  raw: Dc.TypeOf<typeof codec>
): Rd.Reader<SourceRecord, API> =>
  pipe(
    Rd.Do,
    Rd.bind('fnArray', () => Function.finalizeArray(raw.function ?? [])),
    Rd.bind('ctArray', () => Constant.finalizeArray(raw.constant ?? [])),
    Rd.bind('nsArray', () => Namespace.finalizeArray(raw.namespace ?? [])),
    Rd.map(({ fnArray, ctArray, nsArray }) => ({
      functions: apiGroup(fnArray),
      constants: apiGroup(ctArray),
      namespaces: apiGroup(nsArray),
      enums: pipe(raw.enum ?? [], Enum.finalizeArray, apiGroup),
      types: pipe(raw.type ?? [], Type.finalizeArray, apiGroup),
      tags: pipe(raw.tag ?? [], Tag.finalizeArray, apiGroup),
    }))
  );

// ----------------------------------------------------------------------------
// yaml schema and parser
// ----------------------------------------------------------------------------

const doctypes: ReadonlyArray<DocType> = [
  'constant',
  'enum',
  'function',
  'namespace',
  'tag',
  'type',
];

const doctypeLookup = pipe(doctypes, RA.toRecord(identity));

const YAML_SCHEMA = pipe(
  doctypes,
  RA.map((dt) => {
    return new yaml.Type('!' + dt, {
      kind: 'mapping',
      resolve: (data) => data !== null && typeof data === 'object',
      construct: (data): unknown => ({ ...data, doctype: dt }),
    });
  }),
  (ts) => yaml.DEFAULT_SCHEMA.extend([...ts])
);

type MarkedOutput = { readonly doctype: DocType };
type MarkedOutputWithFilepath = MarkedOutput & { readonly filepath: string };

const assertMarkedOutput = E.fromPredicate(
  (output: unknown): output is MarkedOutput => {
    if (typeof output !== 'object' || output === null) return false;
    if (!('doctype' in output)) return false;
    const dt = output.doctype;
    return typeof dt === 'string' && doctypeLookup[dt] === dt;
  },
  constant('Top-level object does not have a recognized doctype')
);

const loadYaml = flow(
  E.tryCatchK(
    (content: string) => yaml.load(content, { schema: YAML_SCHEMA }),
    FS.toErrorString
  ),
  E.chain(assertMarkedOutput)
);

const decodeYamls = (
  yamls: ReadonlyArray<MarkedOutputWithFilepath>
): E.Either<string, Dc.TypeOf<typeof codec>> =>
  pipe(
    yamls,
    RNEA.fromReadonlyArray,
    E.fromOption(constant('No valid yamls found')),
    E.map(RNEA.groupBy(({ doctype }) => doctype)),
    E.map(RR.map(RA.toRecord((mo) => mo.filepath))),
    E.chainW(codec.decode),
    E.mapLeft((e) => (typeof e === 'string' ? e : Dc.draw(e)))
  );

// ----------------------------------------------------------------------------
// loader
// ----------------------------------------------------------------------------

type YamlError = {
  readonly filepath: string;
  readonly error: string;
};

const integrateFilepath = (
  either: E.Either<string, MarkedOutput>,
  filepath: string
) =>
  pipe(
    either,
    E.bimap(
      (error) => ({ error, filepath }),
      (ok): MarkedOutputWithFilepath => ({ ...ok, filepath })
    )
  );

export type ParseError = ReadonlyArray<YamlError> | string;

const fileAp = E.getApplicativeValidation(RA.getSemigroup<YamlError>());

export const parseFiles = (
  files: ReadonlyArray<FS.LocalFile>
): E.Either<ParseError, Dc.TypeOf<typeof codec>> => {
  const [contents, filepaths] = RA.unzip(files);
  return pipe(
    contents,
    RA.map(loadYaml),
    (results) => RA.zipWith(results, filepaths, integrateFilepath),
    RA.traverse(fileAp)(E.mapLeft(RA.of)), // accumulate errors
    E.chainW(decodeYamls)
  );
};

export const parseFilesAndFinalize = flow(
  parseFiles,
  RE.fromEither,
  RE.chainReaderKW(finalize)
);
