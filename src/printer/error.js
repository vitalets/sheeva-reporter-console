/**
 * Prints errors
 */

const chalk = require('chalk');

module.exports = class ErrorPrinter {
  constructor(index, data) {
    this._index = index;
    this._data = data;
    this._error = data.error;
  }

  print() {
    if (this._isAssertionError()) {
      this._printIndex();
      this._printEnv();
      this._printFile();
      this._printSuiteTree();
      this._printErrorMessage();
    } else {
      console.error(this._error);
    }
  }

  _printIndex() {
    console.log(chalk.bold.red(`ERROR #${this._index}`));
  }

  _printEnv() {
    const {env} = this._data;
    console.log(chalk.bold(env.label));
  }

  _printFile() {
    const {test} = this._data;
    const file = test.parents[0].name;
    console.log(file);
  }

  _printSuiteTree() {
    const {test} = this._data;
    const suites = test.parents.slice(1);
    const str = []
      .concat(suites.map(suite => chalk.gray(suite.name)))
      .concat([chalk.red(test.name)])
      .map((item, i) => ' '.repeat(i * 2) + item)
      .join('\n');
    console.log(str);
  }

  _printErrorMessage() {
    console.log(this._error.message);
  }

  // todo: more universal way to detect assertion error?
  _isAssertionError() {
    return this._error.name === 'AssertionError' || this._error.name === 'UnexpectedError';
  }
};
