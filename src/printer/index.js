/**
 * Prints data to console
 */

const chalk = require('chalk');
const path = require('path');
const {pluralize, leftPad, num} = require('./utils');
const StickyCursor = require('./sticky-cursor');
const EndedSlots = require('./ended-slots');
const RunningSlots = require('./running-slots');
const Header = require('./header');

const COLORS = ['green', 'yellow', 'blue', 'white'];

module.exports = class Printer {
  constructor(collector) {
    this._collector = collector;
    this._cursor = null;
    this._runningSlots = new RunningSlots(this._collector);
    this._envColors = new Map();
  }

  stickCursor() {
    this._cursor = new StickyCursor();
    this._runningSlots.setCursor(this._cursor);
  }

  unstickCursor() {
    if (this._cursor) {
      this._cursor.clear();
    }
  }

  printHeader() {
    new Header(this._collector.runnerStat).print();
  }

  printEnvs() {
    this._collector.envStats.forEach((envStat, env) => {
      this.printEnvLine({env});
    });
  }

  printEnvLine(data) {
    const {label, tests, index, started, ended} = this._collector.getEnvStat(data);
    const barColor = this._getEnvColor(data.env);
    let line = `${chalk[barColor]('▇')} ${chalk.bold(label)}: `;
    if (started) {
      const action = ended ? `done` : `executed`;
      const counts = `${num(tests.ended)} of ${num(tests.total)} ${pluralize('test', tests.total)}`;
      const status = tests.failed
        ? chalk.red(`${tests.failed} FAILED`)
        : (tests.success ? chalk.green(`SUCCESS`) : '');
      line += `${action} ${counts} ${status}`;
    } else {
      line += chalk.gray(`pending`);
    }
    this._cursor.write(index, line);
  }

  printRunningSlots(data) {
    this._runningSlots.print(data);
  }

  printSlotBars() {
    new EndedSlots(this._collector.sessions, this._envColors).print();
  }

  printFooter() {
    const {duration, errorsData} = this._collector.runnerStat;
    console.log(chalk.bold[errorsData.size ? 'red' : 'green'](`Errors: ${errorsData.size}`));
    console.log(`Total time: ${chalk.cyan(duration)} ms`);
    console.log(`Done.`);
  }

  printErrors() {
    const {errorsData} = this._collector.runnerStat;
    errorsData.forEach(data => this.printError(data));
  }

  printError(data) {
    if (isAssertionError(data.error)) {
      console.log(formatAssertionError(data));
      if (data.error.originalError) {
        console.error(data.error.originalError);
      }
    } else {
      console.error(data.error);
    }
  }

  _getEnvColor(env) {
    let color = this._envColors.get(env);
    if (!color) {
      color = COLORS[this._envColors.size % COLORS.length];
      this._envColors.set(env, color);
    }
    return color;
  }
};

// todo: more universal way to detect assertion error?
function isAssertionError(error) {
  return error.name === 'AssertionError' || error.name === 'UnexpectedError'
}

function formatAssertionError({error, test}) {
  return []
    .concat(test.parents.map(suite => suite.name))
    .concat([test.name])
    .map((item, i) => ' '.repeat(i * 2) + item)
    .concat([error.message])
    .join('\n');
}
