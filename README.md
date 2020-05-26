# Plex Webhooks Server plugin for Homebridge
[![npm](https://img.shields.io/npm/v/homebridge-plex-webhooks.svg)](https://www.npmjs.com/package/homebridge-plex-webhooks)
[![npm](https://img.shields.io/npm/dt/homebridge-plex-webhooks.svg)](https://www.npmjs.com/package/homebridge-plex-webhooks)

This plugin based on [Plex Webhooks](https://support.plex.tv/articles/115002267687-webhooks/) which can provide smooth and fast automation experience. It creates an occupancy sensor in your Home app what can be used to create custom automations like triggering movie lights 

Please note, Webhooks are a premium feature and require an active [Plex Pass Subscription](https://support.plex.tv/articles/categories/intro-to-plex/plex-pass-subscriptions/) for the Plex Media Server account. In case you don't own Plex Pass Subscription, check out this plugin as an alternate: [homebridge-plex-v2](https://github.com/iharosi/homebridge-plex-v2)

## Installation

This plugin is published through NPM and should be installed „globally”:

```bash
sudo npm install -g --unsafe-perm homebridge-plex-webhooks
```

If you don't have a Homebridge installation yet, head over to the [project documentation](https://github.com/homebridge/homebridge) for more information.

## Configuration

You can use the following options in your homebridge config:

Variable | Description
-------- | -----------
`accessory` | Must be `PlexWebhooksServer`
`name` | Whatever you want the accessory to be named in Home app
`host` | In case you have multiple IPs, you can set which the server should listen on. Can be omitted. Defaults to your first valid IP address.
`port` | The port where the server should listen. Can be omitted. Defaults to 32401.

Sample config:

```json
  "accessories": [
    {
      "accessory": "PlexWebhooksServer",
      "name": "Plex",
      "host": "192.168.12.123",
      "port": "12345"
    }
  ]
```

## Issues, feature requests

In case you found a bug please [raise a ticket](https://github.com/iharosi/homebridge-plex-webhooks/issues/new/choose) and give as many details as you can.

If you would like to suggest a feature feel free to open a ticket, however I can't promise anything. :)
