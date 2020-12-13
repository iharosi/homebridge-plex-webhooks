const {
  PKG_AUTHOR,
  PKG_NAME,
  PKG_VERSION,
  PLAY_EVENTS,
  PAUSE_EVENTS
} = require('./constants');

class PlexWebhooksPlatformAccessory {
  constructor(platform, accessory) {
    const { api: { hap: { Service, Characteristic } }, log } = platform;
    const { device } = accessory.context;

    this.accessory = accessory;
    this.platform = platform;
    this.name = device.name;
    this.uuid = device.uuid;
    this.sn = device.sn;
    this.log = log;
    this.state = 'media.stop';
    this.service = this.accessory.getService(Service.OccupancySensor) ||
      this.accessory.addService(Service.OccupancySensor);

    this.accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.FirmwareRevision, PKG_VERSION)
      .setCharacteristic(Characteristic.Manufacturer, PKG_AUTHOR)
      .setCharacteristic(Characteristic.Model, PKG_NAME)
      .setCharacteristic(Characteristic.SerialNumber, this.sn);
    this.service.setCharacteristic(Characteristic.Name, this.name);
    this.service.getCharacteristic(Characteristic.OccupancyDetected)
      .on('get', this.getState.bind(this));

    this.accessory.on('identify', () => {
      this.log.info(`${this.accessory.displayName} occupancy sensor identified!`);
    });

    this.accessory.context.setState = this.setState.bind(this);

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
      this.log.info(`[${this.accessory.context.device.name}] is active`);
    } else {
      this.log.info(`[${this.accessory.context.device.name}] is inactive`);
    }
  }

  getState(callback) {
    const occupied = PLAY_EVENTS.includes(this.state);

    callback(null, occupied);
  }

  setState(state) {
    if (!this._isValidEvent(state)) {
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
