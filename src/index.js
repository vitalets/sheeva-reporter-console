/**
 * Reporter that just put events into log
 */

const Printer = require('./printer');

module.exports = class ProgressReporter {
  constructor() {
    this._envStat = new Map();
    this._errors = [];
    this._printer = new Printer();
    this._startTime = null;
  }
  handleEvent(event, data) {
    // console.log('console-reporter:', event, data.error)
    if (data.error) {
      this._errors.push(data);
    }
    switch (event) {
      case 'RUNNER_START': {
        const {files, config, envs} = data;
        this._initEnvStat(envs);
        this._startTime = data.timestamp;
        this._printer.printHeader({files, envs, concurrency: config.concurrency});
        break;
      }
      case 'RUNNER_END': {
        this._printer.printFooter({errors: this._errors, startTime: this._startTime});
        break;
      }
      case 'ENV_START': {
        const stat = this._getStat(data.env);
        stat.label = data.label;
        stat.tests.total = data.testsCount;
        const row = this._getRow(data.env);
        this._printer.printTestsLine(row, stat);
        break;
      }
      case 'ENV_END': {
        //console.log(event, data.env);
        break;
      }
      case 'SESSION_START': {
        const stat = this._getStat(data.env);
        const sessionStat = {
          index: stat.sessions.size,
          currentFile: '',
          doneFiles: 0,
          done: false,
        };
        stat.sessions.set(data.session, sessionStat);
        const row = this._getRow(data.env) + sessionStat.index + 1;
        this._printer.printSessionLine(row, sessionStat);
        break;
      }
      case 'SESSION_END': {
        const stat = this._getStat(data.env);
        const sessionStat = stat.sessions.get(data.session);
        sessionStat.currentFile = '';
        sessionStat.done = true;
        stat.sessions.set(data.session, sessionStat);
        const row = this._getRow(data.env) + sessionStat.index + 1;
        this._printer.printSessionLine(row, sessionStat);
        break;
      }
      case 'SUITE_START': {
        if (!data.suite.parent) {
          const stat = this._getStat(data.env);
          const sessionStat = stat.sessions.get(data.session);
          sessionStat.currentFile = data.suite.name;
          stat.sessions.set(data.session, sessionStat);
          const row = this._getRow(data.env) + sessionStat.index + 1;
          this._printer.printSessionLine(row, sessionStat);
        }
        break;
      }
      case 'SUITE_END': {
        if (!data.suite.parent) {
          const stat = this._getStat(data.env);
          const sessionStat = stat.sessions.get(data.session);
          sessionStat.doneFiles++;
          stat.sessions.set(data.session, sessionStat);
          const row = this._getRow(data.env) + sessionStat.index + 1;
          this._printer.printSessionLine(row, sessionStat);
        }
        break;
      }
      case 'TEST_END': {
        const stat = this._getStat(data.env);
        stat.tests.ended++;
        if (data.error) {
          stat.tests.failed++;
        } else {
          stat.tests.success++;
        }
        const row = this._getRow(data.env);
        this._printer.printTestsLine(row, stat);
        return;
      }
    }
  }
  _initEnvStat(envs) {
    envs.forEach((env, index) => {
      this._envStat.set(env, {
        index,
        label: '',
        tests: {
          total: 0,
          running: 0,
          ended: 0,
          success: 0,
          failed: 0,
        },
        errors: [],
        sessions: new Map()
      });
    });
  }
  _getStat(env) {
    return this._envStat.get(env);
  }
  _getRow(env) {
    let row = 0;
    for (let key of this._envStat.keys()) {
      if (key !== env) {
        row += this._envStat.get(key).sessions.size + 1;
      } else {
        break;
      }
    }
    return row;
  }
};
