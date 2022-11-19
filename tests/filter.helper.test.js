const beforeEach = require('mocha').beforeEach;
const describe = require('mocha').describe;
const it = require('mocha').it;
const chai = require('chai');
const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const FilterHelper = require('../lib/helpers/filter-helper');
const payload1 = require('./data/payload_1.json');
const payload2 = require('./data/payload_2.json');
const payload3 = require('./data/payload_3.json');
const config = require('./data/config.json');
const configEmpty = require('./data/config_empty.json');

chai.should();
chai.use(sinonChai);

describe('Filter helper\'s', function() {
  it('constructor should instatiate', function() {
    const filterHelper = new FilterHelper({ verbose: () => {} });

    assert.ok(filterHelper instanceof FilterHelper);
  });

  describe('_matchFilterPair function', function() {
    const log = {};

    beforeEach(() => {
      log.verbose = sinon.spy();
    });

    it('should find movie at Metadata.librarySectionType in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1);
      const result = filterHelper._matchFilterPair('Metadata.librarySectionType', 'movie');

      assert.equal(result, true);
      expect(log.verbose).to.have.been.calledWith(
        ' + looking for "movie" at "Metadata.librarySectionType", found "movie"'
      );
    });

    it('shouldn\'t find show at Metadata.librarySectionType in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1);
      const result = filterHelper._matchFilterPair('Metadata.librarySectionType', 'show');

      expect(result).to.equal(false);
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "show" at "Metadata.librarySectionType", found "movie"'
      );
    });

    it('should find Apple TV at Player.title in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1);
      const result = filterHelper._matchFilterPair('Player.title', 'Apple TV');

      assert.equal(result, true);
      expect(log.verbose).to.have.been.calledWith(
        ' + looking for "Apple TV" at "Player.title", found "Apple TV"'
      );
    });

    it('shouldn\'t find Safari at Player.title in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1);
      const result = filterHelper._matchFilterPair('Player.title', 'Safari');

      assert.equal(result, false);
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "Safari" at "Player.title", found "Apple TV"'
      );
    });

    it('should find show at Metadata.librarySectionType in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2);
      const result = filterHelper._matchFilterPair('Metadata.librarySectionType', 'show');

      assert.equal(result, true);
      expect(log.verbose).to.have.been.calledWith(
        ' + looking for "show" at "Metadata.librarySectionType", found "show"'
      );
    });

    it('shouldn\'t find movie at Metadata.librarySectionType in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2);
      const result = filterHelper._matchFilterPair('Metadata.librarySectionType', 'movie');

      expect(result).to.equal(false);
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "movie" at "Metadata.librarySectionType", found "show"'
      );
    });

    it('should find Safari at Player.title in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2);
      const result = filterHelper._matchFilterPair('Player.title', 'Safari');

      assert.equal(result, true);
      expect(log.verbose).to.have.been.calledWith(
        ' + looking for "Safari" at "Player.title", found "Safari"'
      );
    });

    it('shouldn\'t find Apple TV at Player.title in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2);
      const result = filterHelper._matchFilterPair('Player.title', 'Apple TV');

      assert.equal(result, false);
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "Apple TV" at "Player.title", found "Safari"'
      );
    });

    it('should match when Player.title is not Apple TV in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2);
      const result = filterHelper._matchFilterPair('Player.title', 'Apple TV', '!==');

      assert.equal(result, true);
      expect(log.verbose).to.have.been.calledWith(
        ' + looking for "Apple TV" at "Player.title", found "Safari"'
      );
    });
  });

  describe('_matchFilterArray function', function() {
    const log = {};

    beforeEach(() => {
      log.verbose = sinon.spy();
    });

    it('should found a match in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1);
      const result = filterHelper._matchFilterArray(config.sensors[0].filters[1]);

      expect(result).to.equal(true);
      expect(log.verbose).to.have.been.calledWith(
        ' + looking for "movie" at "Metadata.librarySectionType", found "movie"'
      );
      expect(log.verbose).to.have.been.calledWith(
        ' + looking for "Apple TV" at "Player.title", found "Apple TV"'
      );
    });

    it('shouldn\'t found a match in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2);
      const result = filterHelper._matchFilterArray(config.sensors[0].filters[1]);

      expect(result).to.equal(false);
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "movie" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "Apple TV" at "Player.title", found "Safari"'
      );
    });

    it('shouldn\'t found a match in payload #3', function() {
      const filterHelper = new FilterHelper(log, payload3);
      const result = filterHelper._matchFilterArray(config.sensors[0].filters[1]);

      expect(result).to.equal(false);
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "movie" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose).to.have.been.calledWith(
        ' - looking for "Apple TV" at "Player.title", found "Roku"'
      );
    });
  });

  describe('match function for sensor #1', function() {
    const log = {};

    beforeEach(() => {
      log.verbose = sinon.spy();
    });

    it('should find a match in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1, config.sensors[0].filters);
      const result = filterHelper.match();

      expect(result).to.equal(true);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' + looking for "movie" at "Metadata.librarySectionType", found "movie"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' - looking for "Safari" at "Player.title", found "Apple TV"'
      );
      expect(log.verbose.getCall(3).args[0]).to.equal(' > filter group #2');
      expect(log.verbose.getCall(4).args[0]).to.equal(
        ' + looking for "movie" at "Metadata.librarySectionType", found "movie"'
      );
      expect(log.verbose.getCall(5).args[0]).to.equal(
        ' + looking for "Apple TV" at "Player.title", found "Apple TV"'
      );
    });

    it('shouldn\'t find a match in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2, config.sensors[0].filters);
      const result = filterHelper.match();

      expect(result).to.equal(false);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' - looking for "movie" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' + looking for "Safari" at "Player.title", found "Safari"'
      );
      expect(log.verbose.getCall(3).args[0]).to.equal(' > filter group #2');
      expect(log.verbose.getCall(4).args[0]).to.equal(
        ' - looking for "movie" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(5).args[0]).to.equal(
        ' - looking for "Apple TV" at "Player.title", found "Safari"'
      );
    });

    it('shouldn\'t find a match in payload #3', function() {
      const filterHelper = new FilterHelper(log, payload3, config.sensors[0].filters);
      const result = filterHelper.match();

      expect(result).to.equal(false);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' - looking for "movie" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' - looking for "Safari" at "Player.title", found "Roku"'
      );
      expect(log.verbose.getCall(3).args[0]).to.equal(' > filter group #2');
      expect(log.verbose.getCall(4).args[0]).to.equal(
        ' - looking for "movie" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(5).args[0]).to.equal(
        ' - looking for "Apple TV" at "Player.title", found "Roku"'
      );
    });
  });

  describe('match function for sensor #2', function() {
    const log = {};

    beforeEach(() => {
      log.verbose = sinon.spy();
    });

    it('shouldn\'t find a match in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1, config.sensors[1].filters);
      const result = filterHelper.match();

      expect(result).to.equal(false);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' - looking for "show" at "Metadata.librarySectionType", found "movie"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' - looking for "Roku" at "Player.title", found "Apple TV"'
      );
    });

    it('shouldn\'t find a match in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2, config.sensors[1].filters);
      const result = filterHelper.match();

      expect(result).to.equal(false);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' + looking for "show" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' - looking for "Roku" at "Player.title", found "Safari"'
      );
    });

    it('should find a match in payload #3', function() {
      const filterHelper = new FilterHelper(log, payload3, config.sensors[1].filters);
      const result = filterHelper.match();

      expect(result).to.equal(true);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' + looking for "show" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' + looking for "Roku" at "Player.title", found "Roku"'
      );
    });
  });

  describe('match function for sensor #3', function() {
    const log = {};

    beforeEach(() => {
      log.verbose = sinon.spy();
    });

    it('shouldn\'t find a match in payload #1', function() {
      const filterHelper = new FilterHelper(log, payload1, config.sensors[2].filters);
      const result = filterHelper.match();

      expect(result).to.equal(false);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' - looking for "show" at "Metadata.librarySectionType", found "movie"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' - looking for "Roku" at "Player.title", found "Apple TV"'
      );
    });

    it('shouldn\'t find a match in payload #2', function() {
      const filterHelper = new FilterHelper(log, payload2, config.sensors[2].filters);
      const result = filterHelper.match();

      expect(result).to.equal(false);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' + looking for "show" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' - looking for "Roku" at "Player.title", found "Safari"'
      );
    });

    it('should find a match in payload #3', function() {
      const filterHelper = new FilterHelper(log, payload3, config.sensors[2].filters);
      const result = filterHelper.match();

      expect(result).to.equal(true);
      expect(log.verbose.getCall(0).args[0]).to.equal(' > filter group #1');
      expect(log.verbose.getCall(1).args[0]).to.equal(
        ' + looking for "show" at "Metadata.librarySectionType", found "show"'
      );
      expect(log.verbose.getCall(2).args[0]).to.equal(
        ' + looking for "Roku" at "Player.title", found "Roku"'
      );
    });
  });

  describe('match function for sensor without filters', function() {
    const log = {};

    beforeEach(() => {
      log.verbose = sinon.spy();
    });

    it('should return true', function() {
      const filterHelper = new FilterHelper(log, payload1, configEmpty.sensors[0].filters);
      const result = filterHelper.match();

      expect(result).to.equal(true);
      expect(log.verbose.getCall(0).args[0]).to.equal(
        ' > no filter has given, matching by default...'
      );
    });
  });
});
