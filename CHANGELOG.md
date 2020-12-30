# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2020-12-30
### Fixed
* Fix „context.setState is missing” error by updating accessories after plugin initialization
* Fix PayPal badge on the plugin's NPM page

## [2.1.0] - 2020-12-25
### Added
* New badges on the project's README
* Donate link for the plugin's tile in Homebridge UI

### Changed
* Tabs for sensors on Homebridge UI settings panel

### Fixed
* Fix schema to remove behavior of adding „null” entries to filters array in config

## [2.0.6] - 2020-12-24
### Fixed
* Handle webhooks server errors

## [2.0.5] - 2020-12-24
### Fixed
* Handle sensor registering issue

## [2.0.4] - 2020-12-22
### Fixed
* Update Changelog

## [2.0.3] - 2020-12-22
### Fixed
* Fix server configuration

## [2.0.2] - 2020-12-22
### Fixed
* Add Homebridge UI config schema to NPM release

## [2.0.1] - 2020-12-22
### Fixed
* Add missing libraries to NPM release

## [2.0.0] - 2020-12-22
### Added
* BREAKING CHANGES!
* PlexWebhooks plugin is working now as a hombridge platform (instead of an accessory) to prevent unnecessary server launches and speed up the webhook triggering
* Completely new configuration options
* Landing page to speed up Webhooks configuration of PMS
* Configuration scheme to support plugin configuration from Homebridge UI

## 1.1.1 (2020-07-12)
### Added
* More detailed debug messages

### Fixed
* Fix webserver instantiation to support multiple accessories

## 1.1.0 (2020-05-28)
### Added

* Filtering option to activate sensors only when specific device/user/etc. starting playback

## 1.0.0 (2020-05-27)
### Added

* First release
