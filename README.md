<p align="center">
  <img src="/assets/1050684.jpg" />
</p>
<p align="center">
  <strong>Documentation files for EDOPro's Card Scripting API</strong>
</p>

Entries are in yaml format, found under [`/docs`](/docs/).
The repository is also a typescript package for the default loader module that provides typings and validates entries as strictly as possible.
This can be installed with npm.

```
npm i @that-hatter/scrapiyard
```

## Usage

The most relevant function is `loadYard`. It is recommended to use [`fp-ts`](https://gcanti.github.io/fp-ts/) for the least amount of friction.

```ts
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as sy from '@that-hatter/scrapiyard';

const program = pipe(
  sy.loadYard(sy.DEFAULT_OPTIONS),
  TE.map(({ api }) => {
    // ...
  })
);
```

There are also more modular functions that perform specific steps, such as `loadAPI`, `loadRawAPI`, and `loadSourceRecord`.
See [`dump.ts`](/src/dump.ts) for an example usage.

If not using `fp-ts`, you will need to call the value returned by `loadYard` to get a `Promise`, and manually check if its `_tag` is `"Right"`.

```ts
const yard = await sy.loadYard(sy.DEFAULT_OPTIONS)();
if (yard._tag === 'Right') {
  const { api } = yard.right;
  // ...
}
```

## Dumping validated raws in JSON format

- Clone the repo and navigate to it.
- `npm i`
- `npm run dump`
- Check the `dump/` folder for the output (or error).

***

**Inspired, one way or another, by the following projects**
- [Factorio runtime API documentaion](https://lua-api.factorio.com/latest/index-runtime.html)
- [LÖVE wiki](https://love2d.org/wiki/Main_Page)
- [Binding of Isaac modding API documentation](https://wofsauge.github.io/IsaacDocs/rep/)
- [moonwave](https://github.com/evaera/moonwave)
- [sumneko's lua lsp server annotations](https://github.com/LuaLS/lua-language-server/wiki/Annotations)
