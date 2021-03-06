/**
 * Prints footer
 */

const chalk = require('../utils/chalk');
const log = require('../utils/log');

module.exports = class Footer {
  constructor(state) {
    this._state = state;
  }

  print() {
    const {errors, runner} = this._state;
    const duration = runner.times.end - runner.times.start;
    log('');
    log(chalk.underline(`SUMMARY:`));
    log(chalk.bold[errors.size ? 'red' : 'green'](`Errors: ${errors.size}`));
    log(`Total time: ${chalk.cyan.bold(duration)} ms`);
    log(`Done.`);
  }
};
