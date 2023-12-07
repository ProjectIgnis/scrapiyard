import { Octokit } from '@octokit/rest';
import { sequenceT } from 'fp-ts/Apply';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RR from 'fp-ts/ReadonlyRecord';
import * as TE from 'fp-ts/TaskEither';
import { Predicate, and } from 'fp-ts/lib/Predicate';
import fetch from 'node-fetch';
import * as FS from './FileSystem';
import { SourceRecord } from './info/BindingInfo';
import { flow, pipe } from './modules/fp-ts-extended/function';
import * as S from './modules/fp-ts-extended/string';

// ----------------------------------------------------------------------------
// promise interop
// ----------------------------------------------------------------------------

type GitRepo = {
  readonly owner: string;
  readonly repo: string;
};

const auth = process.env.GITHUB_TOKEN;
const ghRest = (auth ? new Octokit({ auth }) : new Octokit()).rest.repos;
const fetchGithubDir = TE.tryCatchK(
  ({ owner, repo }: GitRepo) => ghRest.getContent({ owner, repo, path: '.' }),
  FS.toErrorString
);

type GitFile = {
  readonly url: string;
  readonly content: string;
};

// need to download file content separately since
// octokit doesn't include them when returning a directory;
// using node-fetch to reduce github requests and redundant checks
const fetchGitFile = (urls: {
  html_url: string | null;
  download_url: string | null;
}): TE.TaskEither<string, GitFile> => {
  // octokit types them as possibly null, but the urls should
  // be guaranteed to be strings if the type is `file`
  const url = String(urls.html_url);
  const fetchUrl = String(urls.download_url);
  return pipe(
    TE.tryCatch(
      () => fetch(fetchUrl).then((response) => response.text()),
      FS.toErrorString
    ),
    TE.map((content) => ({ url, content }))
  );
};

const getSourceFiles = (pathFilter: Predicate<string>) => (gr: GitRepo) =>
  pipe(
    fetchGithubDir(gr),
    TE.chain(({ data }) =>
      pipe(
        data instanceof Array ? data : [],
        RA.filter(({ type, path }) => type === 'file' && pathFilter(path)),
        RA.map(fetchGitFile),
        TE.sequenceArray
      )
    )
  );

// ----------------------------------------------------------------------------
// file to SourceRecord conversion
// ----------------------------------------------------------------------------

const toSourceRecordEntry =
  (url: string) => (line: number, name: O.Option<string>) =>
    pipe(
      name,
      O.map((key) => [key, url + '#L' + String(line + 1)] as const)
    );

const toSourceRecord =
  (nameFinder: (line: string) => O.Option<string>) =>
  ({ url: source, content }: GitFile) =>
    pipe(
      content,
      S.split('\n'),
      RA.map(nameFinder),
      RA.filterMapWithIndex(toSourceRecordEntry(source)),
      RR.fromEntries
    );

// ----------------------------------------------------------------------------
// Core source files
// ----------------------------------------------------------------------------

// all exposed functions from the core are generated using macros with
// UPPER_SNAKE_CASE names, taking function names as first parameter
const CORE_MACRO = /^([A-Z_]+)\s*\(([A-Z-a-z_]\w*).*?\)/;

// will be matched against the whole file, not individual lines
const CORE_MODULE = /\n#define\s+LUA_MODULE\s+([A-Z-a-z_]\w*)/;

const coreSourceName = (md: O.Option<string>) => (line: string) =>
  pipe(
    line.match(CORE_MACRO),
    O.fromNullable,
    O.chain(([_, c0, c1]) =>
      sequenceT(O.Apply)(O.fromNullable(c0), O.fromNullable(c1))
    ),
    O.map(([macro, name]) => {
      // hardcode macros that modify the function names passed to them
      if (macro === 'INFO_FUNC_FROM_CODE') return 'Get' + name + 'FromCode';
      if (macro === 'CARD_INFO_FUNC') return 'Get' + name;
      return name;
    }),
    O.map((name) => (O.isSome(md) ? md.value + '.' + name : name))
  );

const coreSourceRecord = (file: GitFile) =>
  pipe(
    file.content.match(CORE_MODULE),
    O.fromNullable,
    O.chain(([_, c0]) => O.fromNullable(c0)),
    (module) => {
      const srcRec = toSourceRecord(coreSourceName(module))(file);
      if (O.isNone(module)) return srcRec;
      // add a source entry for the whole file
      return RR.upsertAt(module.value, file.url)(srcRec);
    }
  );

// all files in the core with exposed functions begin with `lib`
const isCorePath = and(S.startsWith('lib'))(S.endsWith('.cpp'));

const allCoreSourceRecords = flow(
  getSourceFiles(isCorePath),
  TE.map(RA.map(coreSourceRecord))
);

// ----------------------------------------------------------------------------
// Lua source files (extended api)
// ----------------------------------------------------------------------------

// as generic as possible to match any kind of right-hand expressions
const EXT_ASSIGNMENT = /^([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*=/;

const EXT_FUNC_DECLARATION = /^function\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)/;

const extSourceName = (line: string) =>
  pipe(
    line.match(EXT_FUNC_DECLARATION) ?? line.match(EXT_ASSIGNMENT),
    O.fromNullable,
    O.chain(([_, c0]) => O.fromNullable(c0))
  );

const allExtSourceRecords = flow(
  getSourceFiles(S.endsWith('.lua')),
  TE.map(RA.map(toSourceRecord(extSourceName)))
);

// ----------------------------------------------------------------------------
// loader and options
// ----------------------------------------------------------------------------

export type Options = {
  readonly core: GitRepo;
  readonly extended: GitRepo;
};

export const load = ({
  core,
  extended,
}: Options): TE.TaskEither<string, SourceRecord> =>
  pipe(
    [allCoreSourceRecords(core), allExtSourceRecords(extended)],
    TE.sequenceArray,
    TE.map(RA.flatten),
    TE.map(RA.reduce({}, (acc, cur) => ({ ...acc, ...cur })))
  );
