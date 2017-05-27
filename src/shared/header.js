/**
 * Prints header
 */

const chalk = require('../utils/chalk');
const log = require('../utils/log');
const {pluralize, num, numReq} = require('../utils');

module.exports = class Header {
  constructor(result) {
    this._result = result;
  }

  print() {
    this._printFilesTargetsAndConcurrency();
    this._printOnly();
    this._printSkip();
  }

  _printFilesTargetsAndConcurrency() {
    const {matchedFiles, config} = this._result;
    const strFiles = `${numReq(matchedFiles.size)} ${pluralize('file', matchedFiles.size)}`;
    const strTargets = `${numReq(config.targets.length)} ${pluralize('target', config.targets.length)}`;
    const strConcurrency = `concurrency ${num(config.concurrency)}`;
    log(`Sheeva started.`);
    log(`Running ${strFiles} on ${strTargets} with ${strConcurrency}`);
  }

  _printOnly() {
    const files = this._result.only.files.toArray();
    if (files.length) {
      const filesStr = `${num(files.length)} (${chalk.gray(files.join(', '))})`;
      log(`Files with ${chalk.bold.yellow('ONLY')}: ${filesStr}`);
    }
  }

  _printSkip() {
    const files = this._result.skip.files.toArray();
    if (files.length) {
      const filesStr = `${num(files.length)} (${chalk.gray(files.join(', '))})`;
      log(`Files with ${chalk.bold.yellow('SKIP')}: ${filesStr}`);
    }
  }
};
