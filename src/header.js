/**
 * Prints header
 */

const chalk = require('chalk');
const {pluralize, num, numReq} = require('./utils');

module.exports = class Header {
  constructor(result) {
    this._result = result;
  }

  print() {
    this._printFilesEnvsAndConcurrency();
    this._printOnly();
    this._printSkip();
  }

  _printFilesEnvsAndConcurrency() {
    const {processedFiles, config} = this._result;
    const strFiles = `${numReq(processedFiles.size)} ${pluralize('file', processedFiles.size)}`;
    const strEnvs = `${numReq(config.envs.length)} ${pluralize('env', config.envs.length)}`;
    const strConcurrency = `concurrency ${num(config.concurrency)}`;
    console.log(`Sheeva started.`);
    console.log(`Running ${strFiles} on ${strEnvs} with ${strConcurrency}`);
  }

  _printOnly() {
    const files = this._result.only.files.toArray();
    if (files.length) {
      const filesStr = `${num(files.length)} (${chalk.gray(files.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('ONLY')}: ${filesStr}`);
    }
  }

  _printSkip() {
    const files = this._result.skip.files.toArray();
    if (files.length) {
      const filesStr = `${num(files.length)} (${chalk.gray(files.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('SKIP')}: ${filesStr}`);
    }
  }
};
