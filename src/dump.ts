import * as TE from 'fp-ts/TaskEither';
import * as sy from '.';
import { joinPath, mkdir, writeFile } from './FileSystem';
import { flow, pipe } from './modules/fp-ts-extended/function';

const stringify = (val: unknown) => JSON.stringify(val, null, 2);

const getDumpDir = (subdir: string) => joinPath(['.', 'dump', subdir]);

const dumpJSON = (filename: string) =>
  flow(stringify, writeFile(getDumpDir(filename + '.json')));

// TODO: allow different options via cli parameters
const program = pipe(
  mkdir(joinPath(['.', 'dump'])),
  TE.chain(() => sy.loadRawAPI(sy.DEFAULT_OPTIONS.directory)),
  TE.tap(dumpJSON('api')),
  TE.map((api) => {
    // eslint-disable-next-line functional/no-expression-statements
    console.log('Parsing successful.  Check the output in the dump/ folder.');
    return api;
  }),
  TE.tapError((error) => {
    // eslint-disable-next-line functional/no-expression-statements
    console.log('Error encountered. Check the error log in the dump/ folder.');
    return error instanceof Array
      ? dumpJSON('error')(error)
      : writeFile(getDumpDir('error.txt'))(error);
  })
);

// eslint-disable-next-line functional/no-expression-statements
void program();
