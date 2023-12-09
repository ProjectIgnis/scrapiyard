// lets JSON.stringify handle bigints (https://github.com/GoogleChromeLabs/jsbi/issues/30)
// needed because io-ts uses JSON.stringify for error reports (https://github.com/gcanti/io-ts/issues/648)

// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    // eslint-disable-next-line functional/no-this-expressions
    return () => String(this);
  },
});
