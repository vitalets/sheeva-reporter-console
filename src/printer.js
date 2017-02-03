/**
 * Prints data to console
 */

const chalk = require('chalk');
const path = require('path');
const StickyCursor = require('./sticky-cursor');

module.exports = class Printer {
  constructor(collector) {
    this._collector = collector;
    this._cursor = null;
  }

  printHeader() {
    const {files, config, onlyFiles} = this._collector.runnerStat;
    console.log(`Sheeva started.`);
    const strFiles = `Processed ${num(files.length)} file(s).`;
    console.log(files.length ? strFiles : chalk.red(strFiles));
    if (onlyFiles.length) {
      const fileList = chalk.gray(onlyFiles.join(', '));
      console.log(`Found ${chalk.yellow.bold('ONLY')} in ${num(onlyFiles.length)} file(s): ${fileList}`);
    }
    console.log(`Running on ${num(config.envs.length)} env(s) with concurrency = ${num(config.concurrency)}.`);
  }

  printEnvs() {
    this._cursor = new StickyCursor();
    this._collector.envStats.forEach((envStat, env) => {
      this.printEnvLine({env});
    });
  }

  printFooter() {
    const {errors, duration} = this._collector.runnerStat;
    this._printErrors(errors);
    console.log(chalk.bold[errors.length ? 'red' : 'green'](`Errors: ${errors.length}`));
    console.log(`Total time: ${chalk.cyan(duration)} ms`);
    console.log(`Splits: ${this._collector.splits.length}`);
    console.log(`Done.`);
  }

  printEnvLine(data) {
    const {label, tests, index, started, ended} = this._collector.getEnvStat(data);
    let line = formatEnvLabel({label});
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

  printSessions(data) {
    let index = 0;
    for (let session of this._collector.slots.values()) {
      const row = this._collector.envStats.size + index;

      // if reached end of screen...
      if (row === process.stdout.rows - 2 && this._collector.slots.size - index > 1) {
        const invisibleSessions = this._collector.slots.size - index;
        this._cursor.write(row, `and ${chalk.magenta(invisibleSessions)} session(s) more...`);
        return;
      }

      // if data not passed - session was removed, so print each session
      if (!data || session === data.session) {
        const line = this._getSessionLine(session);
        this._cursor.write(row, line);
      }
      index++;
    }

    // if data not passed - session was removed, so cut max row
    if (!data) {
      const usedRows = this._collector.envStats.size + this._collector.slots.size;
      this._cursor.cut(usedRows);
    }
  }

  printRunnerError(data) {
    console.error('Sheeva error!');
    console.error(data.error);
  }

  printSessionBars() {
    this._cursor.clear();
    const comfortBarsWidth = 60;
    const labelsWidth = 50;
    const barsWidth = Math.min(comfortBarsWidth, process.stdout.columns - labelsWidth);
    this._collector.envStats.forEach((envStat, env) => {
      const max = getMaxDuration(envStat.sessions);
      const koef = barsWidth / max;
      normalizeDurations(envStat.sessions, koef);
      this.printEnvLine({env});
      envStat.sessions.forEach(sessionStat => {
        this._printSessionBar(sessionStat, barsWidth, max);
      });
    });
  }

  _printSessionBar(sessionStat, maxWidth, maxValue) {
    const {index, duration, normalized, tests, files} = sessionStat;
    const label = getSessionLabel({index});
    const starting = chalk.white('▇'.repeat(normalized.starting));
    const testing = chalk.green('▇'.repeat(normalized.testing));
    const ending = chalk.white('▇'.repeat(normalized.ending));
    const total = normalized.starting + normalized.testing + normalized.ending;
    const spacer = repeatStr(' ', maxWidth - total + 2);
    const durationStr = duration === maxValue ? chalk.cyan(duration) : duration;
    const footer = `${durationStr} ms, ${tests} test(s), ${files} file(s)`;
    const bar = `${starting}${testing}${ending}`;
    const line = `${label}${bar}${spacer}${footer}`;
    console.log(line);
  }

  _printErrors(errors) {
    errors.forEach(data => {
      if (data.error.name === 'AssertionError') {
        console.log(formatAssertionError(data))
      } else if (data.error.name === 'UnexpectedError') {
        console.log(formatAssertionError(data));
        if (data.error.originalError) {
          console.log(data.error.originalError);
        }
      } else {
        console.log(data.error)
      }
    });
  }

  _getSessionLine(session) {
    const {index, currentFile, ending} = this._collector.getSessionStat({session});
    let line = getSessionLabel({index});
    if (currentFile) {
      const filename = path.basename(currentFile);
      line += `${filename}`;
    } else {
      line += ending ? `ending...` : `starting...`;
    }
    return line;
  }
};

function num(str) {
  return chalk.blue.bold(str);
}

function repeatStr(str, count) {
  count = count < 0 ? 0 : count;
  return str.repeat(count);
}

function formatEnvLabel({label}) {
  return `${chalk.bold(label)}: `
}

function getSessionLabel({index}) {
  const indexStr = index < 10 ? `${index} ` : `${index}`;
  return chalk.magenta(`Session #${indexStr}: `);
}

function getMaxDuration(sessions) {
  let max = 0;
  sessions.forEach(stat => max = Math.max(max, stat.duration));
  return max;
}

function normalizeDurations(sessions, koef) {
  sessions.forEach(stat => {
    stat.normalized = {
      starting: Math.round((stat.started - stat.start) * koef),
      testing: Math.round((stat.ending - stat.started) * koef),
      ending: Math.round((stat.end - stat.ending) * koef),
    };
  });
}

function formatAssertionError(data) {
  return []
    .concat(data.test.parents.map(suite => suite.name))
    .concat([data.test.name])
    .map((item, i) => ' '.repeat(i * 2) + item)
    .concat([data.error.message])
    .join('\n');
}
