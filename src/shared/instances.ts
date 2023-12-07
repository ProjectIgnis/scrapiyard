import * as Eq from 'fp-ts/Eq';
import * as Ord from 'fp-ts/Ord';
import * as S from '../modules/fp-ts-extended/string';

export const nameStringOrd = Ord.contramap(
  ({ name }: { name: string }) => name
)(S.Ord);

export const nameStringEq = Eq.contramap(({ name }: { name: string }) => name)(
  S.Eq
);
