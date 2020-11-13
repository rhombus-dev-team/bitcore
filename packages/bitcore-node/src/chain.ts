module.exports = {
  BTC: {
    lib: require('bitcore-lib'),
    p2p: require('bitcore-p2p')
  },
  BCH: {
    lib: require('bitcore-lib-cash'),
    p2p: require('bitcore-p2p-cash'),
  },
  PART: {
    lib: require('bitcore-lib-rhombus'),
    p2p: require('bitcore-p2p-rhombus'),
  },
};