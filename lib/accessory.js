const {
  PKG_AUTHOR,
  PKG_NAME,
  PKG_VERSION,
  PLAY_EVENTS,
  PAUSE_EVENTS
} = require('./constants');

class PlexWebhooksPlatformAccessory {
  constructor(platform, accessory, sensor) {
    const { api: { hap: { Service, Characteristic } }, log } = platform;

    this.accessory = accessory;
    this.device = sensor;
    this.platform = platform;
    this.log = log;
    this.state = 'media.stop';
    this.service = this.accessory.getService(Service.OccupancySensor) ||
      this.accessory.addService(Service.OccupancySensor);

    this.accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.FirmwareRevision, PKG_VERSION)
      .setCharacteristic(Characteristic.Manufacturer, PKG_AUTHOR)
      .setCharacteristic(Characteristic.Model, PKG_NAME)
      .setCharacteristic(Characteristic.SerialNumber, this.device.sn);
    this.service.setCharacteristic(Characteristic.Name, this.device.name);
    this.service.getCharacteristic(Characteristic.OccupancyDetected)
      .on('get', this.getState.bind(this));

    this.accessory.on('identify', () => {
      this.log.info(`${this.accessory.displayName} occupancy sensor identified!`);
    });

    this.platform.emitter.on('stateChange', this.setState.bind(this));

    return this.accessory;
  }

  _isValidEvent(state) {
    const playing = PLAY_EVENTS.includes(state);
    const paused = PAUSE_EVENTS.includes(state);

    return playing || paused;
  }

  _log() {
    const active = PLAY_EVENTS.includes(this.state);

    if (active) {
      this.log.info(`[${this.device.name}] is active`);
    } else {
      this.log.info(`[${this.device.name}] is inactive`);
    }
  }

  getState(callback) {
    const occupied = PLAY_EVENTS.includes(this.state);

    callback(null, occupied);
  }

  setState(state, uuid) {
    if (uuid !== this.device.uuid || !this._isValidEvent(state, uuid)) {
      return;
    }

    const { api: { hap: { Characteristic } } } = this.platform;

    this.state = state;
    this.service.updateCharacteristic(
      Characteristic.OccupancyDetected,
      PLAY_EVENTS.includes(this.state)
    );

    this._log();
  }
}

module.exports = PlexWebhooksPlatformAccessory;
