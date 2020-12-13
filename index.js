'use strict';

const PlexWebhooksPlatform = require('./lib/platform');

module.exports = api => {
  api.registerPlatform('PlexWebhooks', PlexWebhooksPlatform);
};
