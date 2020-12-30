const chalk = require('chalk');
const EventEmitter = require('events');
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
    this.emitter = new EventEmitter();

    api.on('didFinishLaunching', () => {
      const server = new WebhooksServer(
        this.log,
        this.config,
        this._processPayload.bind(this)
      );

      this._logAccessoriesFoundInConfig();
      this._discoverAccessories();
      server.launch();
    });
  }

  configureAccessory(accessory) {
    this.accessories.push(accessory);
  }

  _discoverAccessories() {
    const { sensors = [] } = this.config;

    const obsolateAccessories = this.accessories
      .filter(accessory => !sensors.map(sensor => sensor.uuid).includes(accessory.UUID));
    const newAccessories = sensors
      .filter(sensor => !this.accessories.map(accessory => accessory.UUID).includes(sensor.uuid));
    const existingAccessories = this.accessories
      .filter(accessory => sensors.map(sensor => sensor.uuid).includes(accessory.UUID));

    this._unregisterAccessories(obsolateAccessories);
    this._registerAccessories(newAccessories);
    this._updateAccessories(existingAccessories);
  }

  _logAccessoriesFoundInConfig() {
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

  _unregisterAccessories(obsolateAccessories) {
    obsolateAccessories.forEach(accessory => {
      const { displayName, UUID } = accessory;

      this.log.info(`Removing accessory [${displayName}] (${UUID})`);
    });

    this.api.unregisterPlatformAccessories(
      'homebridge-plex-webhooks',
      'PlexWebhooks',
      obsolateAccessories
    );
  }

  _registerAccessories(accessories) {
    const { platformAccessory: PlatformAccessory } = this.api;
    const newAccessories = accessories
      .map(sensor => {
        const accessory = new PlatformAccessory(sensor.name, sensor.uuid);
        const PwAccessory = new PlexWebhooksPlatformAccessory(this, accessory, sensor);

        this.log.info(`Registering accessory [${sensor.name}] (${sensor.uuid})`);

        return PwAccessory;
      });

    this.api.registerPlatformAccessories(
      'homebridge-plex-webhooks',
      'PlexWebhooks',
      newAccessories
    );
  }

  _updateAccessories(accessories) {
    const { sensors = [] } = this.config;
    const updatedAccessories = accessories
      .map(accessory => {
        const sensor = sensors.find(sensor => sensor.uuid === accessory.UUID);
        const PwAccessory = new PlexWebhooksPlatformAccessory(this, accessory, sensor);

        this.log.info(`Updating accessory [${sensor.name}] (${sensor.uuid})`);

        return PwAccessory;
      });

    this.api.updatePlatformAccessories(
      'homebridge-plex-webhooks',
      'PlexWebhooks',
      updatedAccessories
    );
  }

  _processPayload(payload) {
    const { sensors = [] } = this.config;

    sensors.filter(sensor => {
      const { filters, name } = sensor;
      const filterHelper = new FilterHelper(this.log, payload, filters);

      this.log.verbose(`Checking filter rulesets of [${name}] sensor:`);

      return filterHelper.match();
    }).forEach(sensor => {
      this.emitter.emit('stateChange', payload.event, sensor.uuid);
    });
  }
}

module.exports = PlexWebhooksPlatform;
