const chalk = require('chalk');
const PlexWebhooksPlatformAccessory = require('./accessory');
const expandConfig = require('./helpers/config-helper');
const FilterHelper = require('./helpers/filter-helper');
const WebhooksServer = require('./server');

class PlexWebhooksPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.log.verbose = msg => {
      if (config.verbose) {
        log.info(chalk.grey(msg));
      } else {
        log.debug(msg);
      }
    };
    this.config = expandConfig(api, config);
    this.api = api;
    this.accessories = [];

    api.on('didFinishLaunching', () => {
      const server = new WebhooksServer(
        this.log,
        this.config,
        this._processPayload.bind(this)
      );

      this._logFoundAccessories();
      this._unregisterAccessories();
      this._registerAccessories();
      server.launch();
    });
  }

  configureAccessory(accessory) {
    this.accessories.push(accessory);
  }

  _logFoundAccessories() {
    const { config: { sensors }, log } = this;

    if (Array.isArray(sensors) && sensors.length > 1) {
      log.info(`Found ${sensors.length} accessories in config:`);
      sensors.forEach(({ name }) => log.info(`• ${name}`));
    } else if (Array.isArray(sensors) && sensors.length === 1) {
      log.info(`Found ${sensors.length} accessory, ${sensors[0].name} in config.`);
    } else {
      log.info('No accessories found in config!');
    }
  }

  _unregisterAccessories() {
    const { sensors = [] } = this.config;
    const oldAccessories = this.accessories
      .filter(accessory => !sensors.map(sensor => sensor.uuid).includes(accessory.UUID))
      .map(accessory => {
        this.log.info(`Unregistering accessory [${accessory.displayName}] (${accessory.UUID})`);

        return accessory;
      });

    this.accessories = this.accessories
      .filter(accessory => sensors.map(sensor => sensor.uuid).includes(accessory.UUID));

    this.api.unregisterPlatformAccessories(
      'homebridge-plex-webhooks',
      'PlexWebhooks',
      oldAccessories
    );
  }

  _registerAccessories() {
    const { platformAccessory: PlatformAccessory } = this.api;
    const { sensors = [] } = this.config;
    const newAccessories = sensors
      .filter(sensor => !this.accessories.map(accessory => accessory.UUID).includes(sensor.uuid))
      .map(sensor => {
        const accessory = new PlatformAccessory(sensor.name, sensor.uuid);

        accessory.context.device = sensor;
        this.log.info(`Registering accessory [${sensor.name}] (${sensor.uuid})`);

        return accessory;
      })
      .map(accessory => new PlexWebhooksPlatformAccessory(this, accessory));

    newAccessories.forEach(accessory => this.accessories.push(accessory));

    this.api.registerPlatformAccessories(
      'homebridge-plex-webhooks',
      'PlexWebhooks',
      newAccessories
    );
  }

  _processPayload(payload) {
    const { sensors = [] } = this.config;

    sensors.filter(sensor => {
      const { filters, name } = sensor;
      const filterHelper = new FilterHelper(this.log, payload, filters);

      this.log.verbose(`Checking filter rulesets of [${name}] sensor:`);

      return filterHelper.match();
    }).forEach(matchedSensor => {
      const { context } = this.accessories
        .find(accessory => accessory.UUID === matchedSensor.uuid);

      context.setState(payload.event, matchedSensor.uuid);
    });
  }
}

module.exports = PlexWebhooksPlatform;
