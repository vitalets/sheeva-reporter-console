/**
 * Prints data to console
 */

const clc = require('cli-color');
const path = require('path');
const StickyCursor = require('./sticky-cursor');

module.exports = class Printer {
  constructor() {
    this._cursor = null;
  }

  printHeader({files, envs, config}) {
    console.log(`Sheeva started.`);
    console.log(`Processed ${num(files.length)} file(s).`);
    console.log(`Running on ${num(envs.length)} env(s) with concurrency = ${num(config.concurrency)}.`);
    this._cursor = new StickyCursor();
  }

  printTestsLine({row, label, tests}) {
    let line = `${clc.bold(label)}: executed ${num(tests.ended)} of ${num(tests.total)} test(s) `;
    line += tests.failed
      ? clc.red(`${tests.failed} FAILED`)
      : (tests.success  ? clc.green(`SUCCESS`) : '');
    this._cursor.write(row, line);
  }

  printSessionLine({row, index, currentFile, duration}) {
    let line = clc.magenta(`Session #${index + 1}: `);
    if (currentFile) {
      const filename = path.basename(currentFile);
      line += `${filename}`;
    } else {
      line += duration ? `done` : `starting...`;
    }
    this._cursor.write(row, line);
  }

  printSessionBars(envStats) {
    const maxWidth = 80;
    envStats.forEach((envStat, env) => {
      const max = getMaxDuration(envStat.sessions);
      const koef = maxWidth / max;
      normalizeDurations(envStat.sessions, koef);
      envStat.sessions.forEach(sessionStat => this._printSessionBar(sessionStat, maxWidth));
    });
  }

  printFooter({errors, duration}) {
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
    console.log(`Errors: ${errors.length}`);
    console.log(`Total time: ${clc.cyan(duration)} ms`);
    console.log(`Done.`);
  }

  _printSessionBar(sessionStat, maxWidth) {
    const label = clc.magenta(`Session #${sessionStat.index + 1}: `);
    const bar = clc.green('▇'.repeat(sessionStat.normalDuration));
    const spacer = ' '.repeat(maxWidth - sessionStat.normalDuration + 1);
    const footer = `${clc.cyan(sessionStat.duration)} ms, ${sessionStat.tests} test(s), ${sessionStat.files} file(s)`;
    const line = label + bar + spacer + footer;
    this._cursor.write(sessionStat.row, line);
  }

};

function num(str) {
  return clc.blue.bold(str);
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
