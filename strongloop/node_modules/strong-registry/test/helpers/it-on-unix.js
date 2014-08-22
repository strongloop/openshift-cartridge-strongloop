module.exports = function itOnUnix(name, test) {
  // Skip tests that fail due to bug in Windows implementation of Node.js
  // https://github.com/joyent/node/issues/3584
  if (process.platform == 'win32')
    it.skip(name, test);
  else
    it(name, test);
};
