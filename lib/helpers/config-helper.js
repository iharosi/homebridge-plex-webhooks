const expandConfig = (api, config) => {
  const { hap: { uuid } } = api;
  const { sensors = [] } = config;

  const sensorsWithUuid = sensors.map(sensor => {
    const sensorUuid = uuid.generate(JSON.stringify(sensor.name));
    const shortSensorUuid = uuid.toShortForm(sensorUuid);

    return {
      ...sensor,
      uuid: sensorUuid,
      sn: shortSensorUuid
    };
  });

  return {
    ...config,
    sensors: sensorsWithUuid
  };
};

module.exports = expandConfig;
