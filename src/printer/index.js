/**
 * Prints data to console
 */

const chalk = require('chalk');
const path = require('path');
const {pluralize, leftPad, num} = require('./utils');
const StickyCursor = require('./sticky-cursor');
const EndedSlots = require('./ended-slots');

module.exports = class Printer {
  constructor(collector) {
    this._collector = collector;
    this._cursor = null;
  }

  stickCursor() {
    this._cursor = new StickyCursor();
  }

  unstickCursor() {
    this._cursor.clear();
  }

  printHeader() {
    const {files, config, onlyFiles, skippedSuites, skippedTests, skippedInFiles} = this._collector.runnerStat;
    console.log(`Sheeva started`);
    console.log(`Environments: ${num(config.envs.length)}, concurrency: ${num(config.concurrency)}`);
    const strFiles = `Files: ${num(files.length)}`;
    console.log(files.length ? strFiles : chalk.red(strFiles));
    if (onlyFiles.length) {
      const filesStr = `${num(onlyFiles.length)} (${chalk.gray(onlyFiles.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('ONLY')}: ${filesStr}`);
    }
    if (skippedInFiles.length) {
      // const suites = skippedSuites.length ? `${num(skippedSuites.length)} suite(s)` : '';
      // const tests = skippedTests.length ? `${num(skippedTests.length)} test(s)` : '';
      // const and = suites && tests ? ' and ' : '';
      const filesStr = `${num(skippedInFiles.length)} (${chalk.gray(skippedInFiles.join(', '))})`;
      console.log(`Files with ${chalk.bold.yellow('SKIP')}: ${filesStr}`);
    }


  }

  printEnvs() {
    this._collector.envStats.forEach((envStat, env) => {
      this.printEnvLine({env});
    });
  }

  printEnvLine(data) {
    const {label, tests, index, started, ended} = this._collector.getEnvStat(data);
    let line = `${chalk.bold(label)}: `;
    if (started) {
      const action = ended ? `done` : `executed`;
      const counts = `${num(tests.ended)} of ${num(tests.total)} test(s)`;
      const status = tests.failed
        ? chalk.red(`${tests.failed} FAILED`)
        : (tests.success ? chalk.green(`SUCCESS`) : '');
      line += `${action} ${counts} ${status}`;
    } else {
      line += chalk.gray(`planned`);
    }
    this._cursor.write(index, line);
  }

  printRunningSessions(data) {
    let index = 0;
    for (let session of this._collector.runningSessions.values()) {
      const row = this._collector.envStats.size + index;

      // if reached end of screen...
      if (row === process.stdout.rows - 2 && this._collector.runningSessions.size - index > 1) {
        const invisibleSessions = this._collector.runningSessions.size - index;
        this._cursor.write(row, `and ${chalk.magenta(invisibleSessions)} slot(s) more...`);
        return;
      }

      // if data not passed - session was removed, so re-print each session
      if (!data || session === data.session) {
        this._printRunningSessionLine(row, session);
      }
      index++;
    }

    // if data not passed - session was removed, so cut max row
    if (!data) {
      const usedRows = this._collector.envStats.size + this._collector.runningSessions.size;
      this._cursor.cut(usedRows);
    }
  }

  printSlotBars() {
    new EndedSlots(this._collector.sessions).print();
  }

  printFooter() {
    const {duration, errorsData} = this._collector.runnerStat;
    console.log(chalk.bold[errorsData.size ? 'red' : 'green'](`Errors: ${errorsData.size}`));
    console.log(`Total time: ${chalk.cyan(duration)} ms`);
    console.log(`Splits: ${this._collector.splits.length}`);
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

  _printRunningSessionLine(row, session) {
    const {currentFile, ending} = this._collector.getSessionStat({session});
    let line = this._getSlotLabel(session.slotIndex + 1);
    if (currentFile) {
      const filename = path.basename(currentFile);
      line += `${filename}`;
    } else {
      line += ending ? `ending...` : `starting...`;
    }
    this._cursor.write(row, line);
  }

  _getSlotLabel(index) {
    const maxIndexWidth = String(this._collector.config.concurrency).length;
    const indexStr = leftPad(index, maxIndexWidth);
    return chalk.magenta(`Slot #${indexStr}: `);
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
