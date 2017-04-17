/**
 * Prints footer
 */

const chalk = require('chalk');

module.exports = class Footer {
  constructor(result) {
    this._result = result;
  }

  print(startTime) {
    const errors = this._result.errors;
    const duration = Date.now() - startTime;
    console.log('');
    console.log(chalk.underline(`SUMMARY:`));
    console.log(chalk.bold[errors.size ? 'red' : 'green'](`Errors: ${errors.size}`));
    console.log(`Total time: ${chalk.cyan(duration)} ms`);
    console.log(`Done.`);
  }
};
