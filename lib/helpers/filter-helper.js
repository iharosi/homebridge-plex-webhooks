const { get } = require('lodash');

class FilterHelper {
  constructor(log, payload, filters) {
    this.log = log;
    this.payload = payload || {};
    this.filters = filters || [];
  }

  _matchFilterPair(path, value) {
    const payloadValue = get(this.payload, path);
    const isMatched = value === String(payloadValue);

    this.log.verbose(
      ` ${isMatched ? '+' : '-'} looking for "${value}" at "${path}", found "${payloadValue}"`
    );

    return isMatched;
  }

  _matchFilterArray(filterArr) {
    return filterArr
      .filter(pathValuePair => pathValuePair && pathValuePair.path && pathValuePair.value)
      .map(({ path, value }) => this._matchFilterPair(path, value))
      .reduce((acc, cur) => {
        return acc && cur;
      }, true);
  }

  match() {
    let result = true;

    if (this.filters.length < 1) {
      this.log.verbose(' > no filter has given, matching by default...');
    }

    if (this.filters.length > 0) {
      result = this.filters
        .filter(filter => Array.isArray(filter))
        .map((filterArr, key) => {
          const index = key + 1;

          this.log.verbose(` > filter group #${index}`);

          return this._matchFilterArray(filterArr);
        })
        .reduce((acc, cur) => {
          return acc || cur;
        }, false);
    }

    return result;
  }
}

module.exports = FilterHelper;
