import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as Dc from 'io-ts/Decoder';
import * as DescInfo from '../info/DescInfo';
import * as SignatureInfo from '../info/SignatureInfo';
import * as TopicInfo from '../info/TopicInfo';
import * as RNEA from '../modules/fp-ts-extended/ReadonlyNonEmptyArray';
import * as RR from '../modules/fp-ts-extended/ReadonlyRecord';
import { constant, flow, pipe } from '../modules/fp-ts-extended/function';
import * as dc from '../shared/decoders';
import { uniqName } from '../shared/decoders';
import { nameStringOrd } from '../shared/instances';

// ----------------------------------------------------------------------------
// Common
// ----------------------------------------------------------------------------

type TypeCommonInfo = {
  readonly doctype: 'type';
  readonly name: string;
  readonly tags: ReadonlyArray<string>;
} & DescInfo.DescInfo &
  TopicInfo.TopicInfo;

const commonInfoCodec = pipe(
  Dc.struct({
    doctype: Dc.literal('type'),
    name: dc.typename,
  }),
  Dc.intersect(Dc.partial({ tags: dc.tagNameArray })),
  Dc.intersect(DescInfo.codec),
  Dc.intersect(TopicInfo.codec)
);

const finalizeCommonInfo = (
  raw: Dc.TypeOf<typeof commonInfoCodec>
): TypeCommonInfo => ({
  doctype: raw.doctype,
  name: raw.name,
  tags: raw.tags ?? [],
  ...DescInfo.finalize(raw),
  ...TopicInfo.finalize(raw),
});

// ----------------------------------------------------------------------------
// Function Type
// ----------------------------------------------------------------------------

// use a symbol so the type can be narrowed against string
export const FUNCTION_TYPE_SYMBOL = Symbol('functionType');

type FunctionTypeInfo = {
  supertype: typeof FUNCTION_TYPE_SYMBOL;
} & SignatureInfo.SignatureInfo;

export type FunctionType = TypeCommonInfo & FunctionTypeInfo;

const functionTypeCodec = pipe(
  Dc.struct({
    supertype: pipe(
      Dc.literal('function'),
      Dc.map(constant(FUNCTION_TYPE_SYMBOL))
    ),
  }),
  Dc.intersect(SignatureInfo.codec)
);

const finalizeFunctionTypeInfo = (
  raw: Dc.TypeOf<typeof functionTypeCodec>
): FunctionTypeInfo => ({
  supertype: FUNCTION_TYPE_SYMBOL,
  ...SignatureInfo.finalize(raw),
});

// ----------------------------------------------------------------------------
// Table Type
// ----------------------------------------------------------------------------

// use a symbol so the type can be narrowed against string
export const TABLE_TYPE_SYMBOL = Symbol('tableType');

export type TableTypeField = {
  readonly name: string | bigint | boolean;
  readonly valueType: RNEA.ReadonlyNonEmptyArray<string>;
} & DescInfo.DescInfo;

export type TableTypeMappedType = {
  readonly keyType: string;
  readonly valueType: RNEA.ReadonlyNonEmptyArray<string>;
} & DescInfo.DescInfo;

type TableTypeInfo = {
  readonly supertype: typeof TABLE_TYPE_SYMBOL;
  readonly fields: ReadonlyArray<TableTypeField>;
  readonly mappedTypes: ReadonlyArray<TableTypeMappedType>;
};

export type TableType = TypeCommonInfo & TableTypeInfo;

const tableFieldCodec = pipe(
  Dc.struct({
    name: dc.expression,
    valueType: dc.typenameArray,
  }),
  Dc.intersect(DescInfo.codec)
);

const tableMappedTypeCodec = pipe(
  Dc.struct({
    keyType: dc.typename,
    valueType: dc.typenameArray,
  }),
  Dc.intersect(DescInfo.codec)
);

const tableTypeCodec = pipe(
  Dc.struct({
    supertype: pipe(Dc.literal('table'), Dc.map(constant(TABLE_TYPE_SYMBOL))),
  }),
  Dc.intersect(
    Dc.partial({
      fields: pipe(
        Dc.array(tableFieldCodec),
        dc.uniqBy<{ name: boolean | bigint | string }>(
          (x) => String(x.name),
          'names'
        )
      ),
      mappedTypes: pipe(
        Dc.array(tableMappedTypeCodec),
        dc.uniqBy<{ keyType: string }>((x) => x.keyType, 'key types')
      ),
    })
  )
);

const finalizeTableTypeInfo = (
  raw: Dc.TypeOf<typeof tableTypeCodec>
): TableTypeInfo => ({
  supertype: TABLE_TYPE_SYMBOL,
  fields: pipe(
    raw.fields ?? [],
    RA.map((r) => ({ ...r, ...DescInfo.finalize(r) }))
  ),
  mappedTypes: pipe(
    raw.mappedTypes ?? [],
    RA.map((r) => ({ ...r, ...DescInfo.finalize(r) }))
  ),
});

// ----------------------------------------------------------------------------
// Other Type
// ----------------------------------------------------------------------------

type OtherTypeInfo = { readonly supertype: O.Option<string> };

export type OtherType = TypeCommonInfo & OtherTypeInfo;

const otherTypeInfoCodec = Dc.partial({ supertype: dc.typename });

const finalizeOtherTypeInfo = (
  raw: Dc.TypeOf<typeof otherTypeInfoCodec>
): OtherTypeInfo => ({ supertype: O.fromNullable(raw.supertype) });

// ----------------------------------------------------------------------------
// Type
// ----------------------------------------------------------------------------

export type Type = FunctionType | TableType | OtherType;

export const codec = pipe(
  Dc.union(functionTypeCodec, tableTypeCodec, otherTypeInfoCodec),
  Dc.intersect(commonInfoCodec)
);

export type Raw = Dc.TypeOf<typeof codec>;

export const finalize = (raw: Raw): Type => {
  const common = finalizeCommonInfo(raw);
  if (raw.supertype === FUNCTION_TYPE_SYMBOL)
    return { ...common, ...finalizeFunctionTypeInfo(raw) };
  if (raw.supertype === TABLE_TYPE_SYMBOL)
    return { ...common, ...finalizeTableTypeInfo(raw) };
  return { ...common, ...finalizeOtherTypeInfo(raw) };
};

export const arrayCodec = pipe(Dc.record(codec), Dc.map(RR.values), uniqName);

export const finalizeArray = flow(RA.map(finalize), RA.sort(nameStringOrd));
