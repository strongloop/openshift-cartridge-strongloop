module.exports = function quoteArg(arg) {
  if (!/[ \t]/.test(arg))
    return arg;
  if (!/"/.test(arg))
    return '"' + arg + '"';

  throw new Error('command line arguments must not contain \'"\' character');
};
