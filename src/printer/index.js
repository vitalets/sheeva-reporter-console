/**
 * Prints data to console
 */

const chalk = require('chalk');
const path = require('path');
const {pluralize, rightPad, num} = require('./utils');
const StickyCursor = require('./sticky-cursor');
const Timeline = require('./timeline');
const Workers = require('./workers');
const Header = require('./header');
const ErrorPrinter = require('./error');

const COLORS = ['green', 'yellow', 'blue', 'white'];

module.exports = class Printer {
  constructor(result) {
    this._result = result;
    this._workers = new Workers(result);
    this._cursor = null;
    this._envColors = new Map();
  }

  stickCursor() {
    this._cursor = new StickyCursor();
    this._workers.setCursor(this._cursor);
  }

  unstickCursor() {
    if (this._cursor) {
      this._cursor.clear();
    }
  }

  printHeader() {
    new Header(this._result).print();
  }

  printEnvs() {
    this._result.executionPerEnv.forEach((execution, env) => {
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

  printWorkers() {
    this._workers.printAll();
  }

  printWorker(data) {
    this._workers.printByIndex(data.session.workerIndex);
  }

  printTimeline() {
    new Timeline(this._collector.sessions, this._envColors).print();
  }

  printFooter() {
    const {duration, errorsData} = this._collector.runnerStat;
    console.log(chalk.underline(`SUMMARY:`));
    console.log(chalk.bold[errorsData.size ? 'red' : 'green'](`Errors: ${errorsData.size}`));
    console.log(`Total time: ${chalk.cyan(duration)} ms`);
    console.log(`Done.`);
  }

  printErrors() {
    const {errorsData} = this._collector.runnerStat;
    let index = 0;
    errorsData.forEach(data => new ErrorPrinter(++index, data).print());
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
