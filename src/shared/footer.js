/**
 * Prints footer
 */

const chalk = require('chalk');

module.exports = class Footer {
  constructor(result) {
    this._result = result;
  }

  print() {
    const {errors, runner} = this._result;
    const duration = runner.times.end - runner.times.init;
    console.log('');
    console.log(chalk.underline(`SUMMARY:`));
    console.log(chalk.bold[errors.size ? 'red' : 'green'](`Errors: ${errors.size}`));
    console.log(`Total time: ${chalk.cyan(duration)} ms`);
    console.log(`Done.`);
  }
};
