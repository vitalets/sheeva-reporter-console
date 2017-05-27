/**
 * Append reporter suitable for CI console.
 */

const chalk = require('../utils/chalk');
const log = require('../utils/log');
const Header = require('../shared/header');
const Footer = require('../shared/footer');
const Targets = require('../shared/targets');
const Timeline = require('../shared/timeline');
const Errors = require('../shared/errors');

module.exports = class AppendReporter {
  constructor() {
    this._percent = 0;
    // fake cursor for Targets
    this._cursor = {
      write: (index, line) => log(line)
    };
  }

  handleEvent(event, data) { // eslint-disable-line complexity
    switch (event) {
      case 'RUNNER_START':
        new Header(data.result).print();
        break;

      case 'RUNNER_END':
        new Targets(data.result, this._cursor).printAll();
        new Timeline(data.result).print();
        new Errors(data.result).print();
        new Footer(data.result).print();
        break;

      case 'TARGET_START':
        log(`${chalk.bold(data.target.label)} started`);
        break;

      case 'TARGET_END':
        log(`${chalk.bold(data.target.label)} ended`);
        break;

      case 'TEST_END': {
        const tests = data.result.runner.tests;
        const percent = 10 * Math.floor(10 * tests.ended / tests.total);
        if (percent !== this._percent) {
          this._percent = percent;
          log(`${this._percent}%`);
        }
        break;
      }
    }
  }


};
