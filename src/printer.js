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
    const {files, envs, config, hasOnly} = this._collector.runnerStat;
    console.log(`Sheeva started.`);
    console.log(`Processed ${num(files.length)} file(s).`);
    if (hasOnly) {
      console.log(chalk.yellow('ONLY mode.'));
    }
    console.log(`Running on ${num(envs.length)} env(s) with concurrency = ${num(config.concurrency)}.`);
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
    console.log(`Errors: ${errors.length}`);
    console.log(`Total time: ${chalk.cyan(duration)} ms`);
    console.log(`Done.`);
  }

  printEnvLine(data) {
    const {label, tests, index, started, ended} = this._collector.getEnvStat(data);
    let line = getEnvLabel({label});
    if (started) {
      const action = ended ? `done` : `executed`;
      const counts = `${num(tests.ended)} of ${num(tests.total)} test(s)`;
      const status = tests.failed
        ? chalk.red(`${tests.failed} FAILED`)
        : (tests.success ? chalk.green(`SUCCESS`) : '');
      line += `${action} ${counts} ${status}`;
    } else {
      line += `planned`;
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
    const {index, duration, tests, files} = sessionStat;
    const normalDuration = sessionStat.normalDuration > 0 ? sessionStat.normalDuration : 0;
    const label = getSessionLabel({index});
    const bar = chalk.green('▇'.repeat(normalDuration));
    const spacer = repeatStr(' ', maxWidth - normalDuration + 1);
    const durationStr = duration === maxValue ? chalk.red(duration) : chalk.cyan(duration);
    const footer = `${chalk.cyan(durationStr)} ms, ${tests} test(s), ${files} file(s)`;
    const line = label + bar + spacer + footer;
    console.log(line);
  }

  _printErrors(errors) {
    errors.forEach(data => {
      if (data.error.name === 'AssertionError') {
        console.log(formatAssertionError(data))
      } else if (data.error.name === 'UnexpectedError') {
//        console.log(data.error.originalError || formatAssertionError(data));
        console.log(formatAssertionError(data));
      } else {
        console.log(data.error)
      }
    });
  }

  _getSessionLine(session) {
    const {index, currentFile, duration} = this._collector.getSessionStat({session});
    let line = getSessionLabel({index});
    if (currentFile) {
      const filename = path.basename(currentFile);
      line += `${filename}`;
    } else {
      line += duration ? `done` : `starting...`;
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

function getEnvLabel({label}) {
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
  sessions.forEach(stat => stat.normalDuration = Math.round(stat.duration * koef));
}

function formatAssertionError(data) {
  return []
    .concat(data.test.parents.map(suite => suite.name))
    .concat([data.test.name])
    .map((item, i) => ' '.repeat(i * 2) + item)
    .concat([data.error.message])
    .join('\n');
}
