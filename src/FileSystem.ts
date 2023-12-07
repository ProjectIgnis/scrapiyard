import * as TE from 'fp-ts/TaskEither';
import fs from 'fs';
import path from 'path';
import * as RA from './modules/fp-ts-extended/ReadonlyArray';
import * as RNEA from './modules/fp-ts-extended/ReadonlyNonEmptyArray';
import { pipe } from './modules/fp-ts-extended/function';

export const toErrorString = (err: unknown) =>
  String(err instanceof Error ? err.message : err);

// prefer not to handle path.join's throw, as we only ever pass strings
export const joinPath = (parts: RNEA.ReadonlyNonEmptyArray<string>) =>
  path.join(...parts);

export const relativePath = (parent: string, sub: string) =>
  path.relative(parent, sub);

export type LocalFile = Readonly<[string, string]>;

const readFileTask = TE.tryCatchK(fs.promises.readFile, toErrorString);

export const readFile = (path: string): TE.TaskEither<string, LocalFile> =>
  pipe(
    readFileTask(path, 'utf-8'),
    TE.map((content) => [String(content), path])
  );

const writeFileTask = TE.tryCatchK(fs.promises.writeFile, toErrorString);

export const writeFile = (path: string) => (content: string) =>
  writeFileTask(path, content);

const mkdirTask = TE.tryCatchK(fs.promises.mkdir, toErrorString);

export const mkdir = (path: string) => mkdirTask(path, { recursive: true });

export const getAllPaths = (
  dir: string
): TE.TaskEither<string, ReadonlyArray<string>> =>
  pipe(
    TE.tryCatch(
      () => fs.promises.readdir(dir, { withFileTypes: true }),
      toErrorString
    ),
    TE.map(
      RA.map((ent) => {
        const sdir = joinPath([dir, ent.name]);
        return ent.isDirectory() ? getAllPaths(sdir) : TE.of([sdir]);
      })
    ),
    TE.chain(TE.sequenceArray),
    TE.map(RA.flatten)
  );
