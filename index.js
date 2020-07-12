'use strict';

const express = require('express');
const ip = require('ip');
const { get, map } = require('lodash');
const multer = require('multer');
const ordinal = require('ordinal');
const {
  author: packageAuthor,
  name: packageName,
  version: packageVersion
} = require('./package.json');

const upload = multer({ dest: '/tmp/' });
const validPlayEvents = [
  'media.play',
  'media.resume'
];
const validPauseEvents = [
  'media.pause',
  'media.stop'
];

class PlexWebhooksServer {
  constructor(log, config, api) {
    const { hap, hap: { Characteristic, Service, uuid } } = api;
    const { name } = config;

    this.config = {
      host: config.host || ip.address(),
      port: config.port || 32401,
      filter: Array.isArray(config.filter) ? config.filter : []
    };
    this.state = 'media.stop';
    this.hap = hap;
    this.log = log;
    this.occupancyService = new Service.OccupancySensor(name);
    this.occupancyService
      .getCharacteristic(Characteristic.OccupancyDetected)
      .on('get', this.getStatus.bind(this));
    this.informationService = new Service
      .AccessoryInformation()
      .setCharacteristic(Characteristic.FirmwareRevision, packageVersion)
      .setCharacteristic(Characteristic.Manufacturer, packageAuthor)
      .setCharacteristic(Characteristic.Model, packageName)
      .setCharacteristic(
        Characteristic.SerialNumber,
        uuid.generate(name)
      );
    this.log.debug('config: ', this.config);
    this.launchServer();
  }

  getServices() {
    return [
      this.informationService,
      this.occupancyService
    ];
  }

  getStatus(callback) {
    this.log.info(`State has requested: ${this.state}`);
    callback(undefined, validPlayEvents.includes(this.state));
  }

  isValidEvent(value) {
    const playing = validPlayEvents.includes(value);
    const paused = validPauseEvents.includes(value);

    return playing || paused;
  }

  processPayload(payload) {
    const { filter } = this.config;
    const match = filter.map((ruleSet, key) => {
      const index = key + 1;

      this.log.debug(
        `Checking the ${ordinal(index)} ruleset:`
      );

      return map(ruleSet, (value, key) => {
        const foundValue = get(payload, key);
        const isMatched = foundValue === value;

        this.log.debug(
          ` ${isMatched ? '+' : '-'} Looking for "${value}" at "${key}", found "${foundValue}".`
        );

        return isMatched;
      }).reduce((acc, cur) => {
        return acc && cur;
      }, true);
    }).reduce((acc, cur) => acc || cur, false);

    if (match) {
      this.log.debug(`One of the rulesets has passed, updating state!`);
      this.setStatus(payload.event);
    } else {
      this.log.debug(`None of the rulesets have passed, skipping state change!`);
    }
  }

  setStatus(value) {
    if (!this.isValidEvent(value)) {
      return;
    }

    this.state = value;
    this.occupancyService
      .getCharacteristic(this.hap.Characteristic.OccupancyDetected)
      .updateValue(validPlayEvents.includes(this.state));
    this.log.info(`State has changed to: ${this.state}`);
  }

  launchServer() {
    const { host, port } = this.config;
    const app = express();

    app.post('/', upload.single('thumb'), (req, res) => {
      const rawPayload = get(req, 'body.payload', '');
      const payload = JSON.parse(rawPayload);

      this.log.debug(req.body);
      this.processPayload(payload);
      res.sendStatus(200);
    });
    app.listen(port, host, () => {
      this.log.info(
        `Plex Webhooks Server is listening at http://${host}:${port}`
      );
    });
  }
}

module.exports = api => {
  api.registerAccessory('PlexWebhooksServer', PlexWebhooksServer);
};
