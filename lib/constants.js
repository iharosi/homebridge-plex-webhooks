const {
  author: PKG_AUTHOR,
  name: PKG_NAME,
  version: PKG_VERSION
} = require('../package.json');

const LISTENING_PORT = 32401;
const PLAY_EVENTS = [
  'media.play',
  'media.resume'
];
const PAUSE_EVENTS = [
  'media.pause',
  'media.stop'
];

module.exports = {
  LISTENING_PORT,
  PKG_AUTHOR,
  PKG_NAME,
  PKG_VERSION,
  PLAY_EVENTS,
  PAUSE_EVENTS
};
