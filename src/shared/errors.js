/**
 * Prints errors
 */

const chalk = require('../utils/chalk');
const log = require('../utils/log');

module.exports = class ErrorsPrinter {
  constructor(result) {
    this._result = result;
    this._error = null;
    this._data = null;
    this._index = 0;
  }

  print() {
    this._result.errors.forEach(this._printError, this);
  }

  _printError(data, error) {
    this._error = error;
    this._data = data;
    this._printHeader();
    if (this._isAssertionError()) {
      this._printErrorMessage();
      this._printOriginalError();
    } else {
      console.error(this._error);
    }
  }

  _printHeader() {
    this._printIndex();
    this._printFile();
    this._printSuiteTree();
  }

  _printIndex() {
    this._index++;
    log(chalk.bold.red(`ERROR #${this._index}`));
  }

  _printFile() {
    const {target, test} = this._data;
    const file = test.parents[0].name;
    log(`${target.label}: ${chalk.gray(file)}`);
  }

  _printSuiteTree() {
    const {test} = this._data;
    const suites = test.parents.slice(1);
    const str = []
      .concat(suites.map(suite => suite.name))
      .concat([test.name])
      .map(item => chalk.bold(item))
      .join(chalk.green.bold(' > '));
    log(str);
  }

  _printErrorMessage() {
    console.error(this._error.message);
  }

  _printOriginalError() {
    if (this._error.originalError) {
      console.error(this._error.originalError);
    }
  }

  // todo: more universal way to detect assertion error?
  _isAssertionError() {
    return this._error.name === 'AssertionError' || this._error.name === 'UnexpectedError';
  }
};
