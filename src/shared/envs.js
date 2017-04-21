/**
 * Prints progress for each env
 */

const chalk = require('chalk');
const {pluralize, num, getEnvColor} = require('./utils');

module.exports = class Envs {
  constructor(result, cursor) {
    this._result = result;
    this._cursor = cursor;
  }

  printAll() {
    this._result.executionPerEnv.forEach((execution, env) => {
      this.printEnv({env, execution});
    });
  }

  printEnv(data) {
    const label = data.env.label;
    const execution = data.execution || this._result.executionPerEnv.get(data.env);
    const {index, tests, started, ended} = execution;
    const barColor = getEnvColor(index);
    let line = `${chalk[barColor]('▇')} ${chalk.bold(label)}: `;
    if (started) {
      const action = ended ? `done` : `executed`;
      const counts = `${num(tests.ended)} of ${num(tests.total)} ${pluralize('test', tests.total)}`;
      const status = tests.failed
        ? chalk.red(`${tests.failed} FAILED`)
        : (tests.success ? chalk.green(`SUCCESS`) : '');
      line += `${action} ${counts} ${status}`;
    } else {
      line += chalk.gray(`pending`);
    }
    this._cursor.write(index, line);
  }
};
