// lets JSON.stringify handle bigints
// https://github.com/GoogleChromeLabs/jsbi/issues/30
// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    // eslint-disable-next-line functional/no-this-expressions
    return () => String(this);
  },
});
