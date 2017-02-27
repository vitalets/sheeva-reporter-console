/**
 * Prints header
 */

const chalk = require('chalk');
const {pluralize, num} = require('./utils');

module.exports = class Header {
  constructor(runnerStat) {
    this._runnerStat = runnerStat;
  }

  print() {
    this._printFilesEnvsAndConcurrency();
    this._printOnly();
    this._printSkip();
  }

  _printFilesEnvsAndConcurrency() {
    const {files, config} = this._runnerStat;
    const strFiles = `${num(files.length)} ${pluralize('file', files.length)}`;
    const strEnvs = `${num(config.envs.length)} ${pluralize('env', config.envs.length)}`;
    const strConcurrency = `concurrency ${num(config.concurrency)}`;
    console.log(`Sheeva started`);
    console.log(`Running ${strFiles} on ${strEnvs} with ${strConcurrency}`);
  }

  _printOnly() {
    const {onlyFiles} = this._runnerStat;
    if (onlyFiles.length) {
      const filesStr = `${num(onlyFiles.length)} (${chalk.gray(onlyFiles.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('ONLY')}: ${filesStr}`);
    }
  }

  _printSkip() {
    const {skippedInFiles} = this._runnerStat;
    if (skippedInFiles.length) {
      const filesStr = `${num(skippedInFiles.length)} (${chalk.gray(skippedInFiles.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('SKIP')}: ${filesStr}`);
    }
  }
};
