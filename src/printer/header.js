/**
 * Prints header
 */

const chalk = require('chalk');
const {pluralize, num, numReq} = require('./utils');

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
    const strFiles = `${numReq(files.length)} ${pluralize('file', files.length)}`;
    const strEnvs = `${numReq(config.envs.length)} ${pluralize('env', config.envs.length)}`;
    const strConcurrency = `concurrency ${num(config.concurrency)}`;
    console.log(`Sheeva started`);
    console.log(`Running ${strFiles} on ${strEnvs} with ${strConcurrency}`);
  }

  _printOnly() {
    const {only} = this._runnerStat;
    if (only.files.length) {
      const filesStr = `${num(only.files.length)} (${chalk.gray(only.files.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('ONLY')}: ${filesStr}`);
    }
  }

  _printSkip() {
    const {skip} = this._runnerStat;
    if (skip.files.length) {
      const filesStr = `${num(skip.files.length)} (${chalk.gray(skip.files.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('SKIP')}: ${filesStr}`);
    }
  }
};
