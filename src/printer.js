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

  printHeader({files, envs, concurrency}) {
    console.log(`Sheeva started.`);
    console.log(`Processed ${num(files.length)} file(s).`);
    console.log(`Running on ${num(envs.length)} env(s) with concurrency = ${num(concurrency)}.`);
    this._cursor = new StickyCursor();
  }

  printTestsLine(row, {label, tests}) {
    let line = `${clc.bold(label)}: executed ${num(tests.ended)} of ${num(tests.total)} test(s) `;
    line += tests.failed
      ? clc.red(`${tests.failed} FAILED`)
      : (tests.success  ? clc.green(`SUCCESS`) : '');
    this._cursor.write(row, line);
  }

  printSessionLine(row, {index, currentFile, done, doneFiles}) {
    let line = clc.magenta(`Session #${index + 1}: `);
    if (currentFile) {
      const filename = path.basename(currentFile);
      line += `${filename}`;
    } else {
      line += done ? `done ${doneFiles} file(s)` : `starting...`;
    }
    this._cursor.write(row, line);
  }

  printFooter({errors, startTime}) {
    errors.forEach(data => {
      if (data.error.name === 'AssertionError') {
        console.log(formatAssertionError(data))
      } else if (data.error.name === 'UnexpectedError') {
        console.log(data.error.originalError || formatAssertionError(data));
      } else {
        console.log(data.error)
      }
    });
    console.log(`Errors: ${errors.length}`);
    console.log(`Time: ${clc.cyan(Date.now() - startTime)} ms`);
    console.log(`Done.`);
  }
};

function num(str) {
  return clc.blue.bold(str);
}

function isAssertionError(data) {
  return data.test && data.error.name === 'AssertionError';
}

function isUnexpectedError(data) {
  return data.test && data.error.name === 'UnexpectedError';
}

function formatAssertionError(data) {
  return []
    .concat(data.test.parents.map(suite => suite.name))
    .concat([data.test.name])
    .map((item, i) => ' '.repeat(i * 2) + item)
    .concat([data.error.message])
    .join('\n');
}
