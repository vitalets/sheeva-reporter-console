/**
 * Prints progress for each target
 */

const chalk = require('../utils/chalk');
const {pluralize, num, getTargetColor} = require('../utils');

module.exports = class Targets {
  constructor(state, cursor) {
    this._state = state;
    this._cursor = cursor;
  }

  printAll() {
    this._state.executionPerTarget.forEach((execution, target) => {
      this.printTarget({target, execution});
    });
  }

  printTarget(data) {
    const label = data.target.label;
    const execution = data.execution || this._state.executionPerTarget.get(data.target);
    const {index, tests, started, ended} = execution;
    const barColor = getTargetColor(index);
    let line = `${chalk[barColor]('▇')} ${chalk.bold(label)}: `;
    line += started ? this._getStartedTargetInfo(ended, tests) : chalk.gray(`pending`);
    this._cursor.write(index, line);
  }

  _getStartedTargetInfo(ended, tests) {
    const action = ended ? `done` : `executed`;
    const counts = `${num(tests.ended)} of ${num(tests.total)} ${pluralize('test', tests.total)}`;
    const status = tests.failed
      ? chalk.red(`${tests.failed} FAILED`)
      : (tests.success ? chalk.green(`SUCCESS`) : '');
    return `${action} ${counts} ${status}`;
  }
};
