/**
 * Append reporter suitable for CI console.
 */

const chalk = require('chalk');
const Header = require('../shared/header');
const Footer = require('../shared/footer');
const Envs = require('../shared/envs');
const Timeline = require('../shared/timeline');
const Errors = require('../shared/errors');

module.exports = class AppendReporter {
  constructor() {
    this._percent = 0;
    // fake cursor for Envs
    this._cursor = {
      write: (index, line) => console.log(line)
    };
  }

  handleEvent(event, data) {
    switch (event) {
      case 'RUNNER_START':
        new Header(data.result).print();
        break;

      case 'RUNNER_END':
        new Envs(data.result, this._cursor).printAll();
        new Timeline(data.result).print();
        new Errors(data.result).print();
        new Footer(data.result).print();
        break;

      case 'ENV_START':
        console.log(`${chalk.bold(data.env.label)} started`);
        break;

      case 'ENV_END':
        console.log(`${chalk.bold(data.env.label)} ended`);
        break;

      case 'TEST_END':
        const tests = data.result.runner.tests;
        const percent = 10 * Math.floor(10 * tests.ended / tests.total);
        if (percent !== this._percent) {
          this._percent = percent;
          console.log(`${this._percent}%`);
        }
        break;
    }
  }


};
