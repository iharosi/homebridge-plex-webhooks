'use strict';

const express = require('express');
const ip = require('ip');
const get = require('lodash/get');
const multer = require('multer');
const {
  author,
  name: packageName,
  version
} = require('./package.json');

const app = express();
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
    const { hap } = api;
    const { name } = config;
    const host = config.host || ip.address();
    const port = config.port || 32401;

    this.hap = hap;
    this.log = log;
    this.state = 'media.stop';
    this.occupancyService = new hap.Service.OccupancySensor(name);
    this.occupancyService
      .getCharacteristic(hap.Characteristic.OccupancyDetected)
      .on('get', this.getStatus.bind(this));
    this.informationService = new hap.Service
      .AccessoryInformation()
      .setCharacteristic(hap.Characteristic.FirmwareRevision, version)
      .setCharacteristic(hap.Characteristic.Manufacturer, author)
      .setCharacteristic(hap.Characteristic.Model, packageName)
      .setCharacteristic(hap.Characteristic.SerialNumber, '-');
    this.launchServer(host, port);
  }

  getServices() {
    return [
      this.informationService,
      this.occupancyService
    ];
  }

  getStatus(callback) {
    this.log.info(`Occupancy sensor state has requested: ${this.state}`);
    callback(undefined, validPlayEvents.includes(this.state));
  }

  isValidEvent(value) {
    const playing = validPlayEvents.includes(value);
    const paused = validPauseEvents.includes(value);

    return playing || paused;
  }

  setStatus(value) {
    if (!this.isValidEvent(value)) {
      return;
    }

    this.state = value;
    this.occupancyService
      .getCharacteristic(this.hap.Characteristic.OccupancyDetected)
      .updateValue(validPlayEvents.includes(this.state));
    this.log.info(`Occupancy sensor state change has triggered: ${this.state}`);
  }

  launchServer(host, port) {
    app.post('/', upload.single('thumb'), (req, res) => {
      const payload = get(req, 'body.payload', '');
      const { event } = JSON.parse(payload);

      this.log.debug(req.body);
      this.setStatus(event);
      res.sendStatus(200);
    });
    app.listen(port, host, () => this.log.info(`Plex Webhooks Server is listening at http://${host}:${port}`));
  }
}

module.exports = api => {
  api.registerAccessory('PlexWebhooksServer', PlexWebhooksServer);
};
