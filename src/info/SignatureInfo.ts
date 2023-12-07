import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray';
import * as Dc from 'io-ts/Decoder';
import { constant, pipe } from '../modules/fp-ts-extended/function';
import * as dc from '../shared/decoders';
import * as DescInfo from './DescInfo';

// ----------------------------------------------------------------------------
// Parameter
// ----------------------------------------------------------------------------

export type Parameter = {
  readonly name: string;
  readonly type: RNEA.ReadonlyNonEmptyArray<string>;
  readonly defaultValue: O.Option<string | bigint | boolean>;
  readonly required: boolean;
} & DescInfo.DescInfo;

const paramCodec = pipe(
  Dc.partial({
    defaultValue: dc.expression,
    required: Dc.boolean,
  }),
  Dc.intersect(
    Dc.struct({
      name: dc.bindingOrVariadic,
      type: dc.typenameArray,
    })
  ),
  Dc.intersect(DescInfo.codec)
);

type RawParameter = Dc.TypeOf<typeof paramCodec>;

const finalizeParam = (raw: RawParameter): Parameter => ({
  name: raw.name,
  type: raw.type,
  defaultValue: O.fromNullable(raw.defaultValue),
  required: raw.required !== false,
  ...DescInfo.finalize(raw),
});

const allOptionalParamsLast = (
  rs: Array<RawParameter>
): rs is Array<RawParameter> =>
  pipe(
    rs,
    A.dropLeftWhile((r) => r.required !== false),
    A.every((r) => r.required === false)
  );

const variadicParamLast = (
  rs: Array<RawParameter>
): rs is Array<RawParameter> =>
  pipe(
    A.init(rs),
    O.map(A.every((r) => r.name !== '...')),
    O.getOrElse(constant(true))
  );

const paramArrayCodec = pipe(
  Dc.array(paramCodec),
  Dc.refine(allOptionalParamsLast, 'all optional parameters are last'),
  Dc.refine(variadicParamLast, 'variadic parameter is last'),
  dc.uniqName
);

// ----------------------------------------------------------------------------
// Return
// ----------------------------------------------------------------------------

export type Return = {
  readonly name: O.Option<string>;
  readonly type: RNEA.ReadonlyNonEmptyArray<string>;
  readonly guaranteed: boolean;
} & DescInfo.DescInfo;

const returnCodec = pipe(
  Dc.partial({
    name: dc.bindingOrVariadic,
    guaranteed: Dc.boolean,
  }),
  Dc.intersect(Dc.struct({ type: dc.typenameArray })),
  Dc.intersect(DescInfo.codec)
);

type RawReturn = Dc.TypeOf<typeof returnCodec>;

const finalizeReturn = (raw: RawReturn): Return => ({
  name: O.fromNullable(raw.name),
  type: raw.type,
  guaranteed: raw.guaranteed !== false,
  ...DescInfo.finalize(raw),
});

const allUnguaranteedReturnsLast = (
  rs: Array<RawReturn>
): rs is Array<RawReturn> =>
  pipe(
    rs,
    A.dropLeftWhile((r) => r.guaranteed !== false),
    A.every((r) => r.guaranteed === false)
  );

const variadicReturnLast = (rs: Array<RawReturn>): rs is Array<RawReturn> =>
  pipe(
    A.init(rs),
    O.map(A.every((r) => r.name !== '...')),
    O.getOrElse(constant(true))
  );

const returnArrayCodec = pipe(
  Dc.array(returnCodec),
  Dc.refine(allUnguaranteedReturnsLast, 'all unguaranteed returns are last'),
  Dc.refine(variadicReturnLast, 'variadic return is last'),
  // can't use uniqByName because return name is optional
  dc.uniqBy<RawReturn>((x) => x.name ?? '', 'names')
);

// ----------------------------------------------------------------------------
// Signature Info
// ----------------------------------------------------------------------------

export type SignatureInfo = {
  readonly parameters: ReadonlyArray<Parameter>;
  readonly returns: ReadonlyArray<Return>;
  readonly overloads: ReadonlyArray<Overload>;
};

export type Overload = Omit<SignatureInfo, 'overloads'> & DescInfo.DescInfo;

export type Variant<T extends SignatureInfo> = T | Overload;

const baseSigCodec = Dc.partial({
  parameters: paramArrayCodec,
  returns: returnArrayCodec,
});

const overloadCodec = Dc.intersect(baseSigCodec)(DescInfo.codec);

export const codec = Dc.intersect(baseSigCodec)(
  Dc.partial({ overloads: Dc.array(overloadCodec) })
);

export type Raw = Dc.TypeOf<typeof codec>;

export const finalize = (raw: Raw): SignatureInfo => ({
  parameters: RA.map(finalizeParam)(raw.parameters ?? []),
  returns: RA.map(finalizeReturn)(raw.returns ?? []),
  overloads: pipe(
    raw.overloads ?? [],
    RA.map((rawOv) => ({ ...finalize(rawOv), ...DescInfo.finalize(rawOv) }))
  ),
});
