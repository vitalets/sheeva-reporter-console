/**
 * Collects runtime data
 */

module.exports = class Collector {
  constructor() {
    this._envStat = new Map();
    this._startTime = Date.now();
  }
  runnerStart(data) {
    data.envs.forEach((env, index) => {
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
  runnerEnd() {
    return {
      errors: this._getAllErrors(),
      duration: Date.now() - this._startTime
    };
  }
  envStart(data) {
    const stat = this._getStat(data.env);
    stat.label = data.label;
    stat.tests.total = data.testsCount;
    const row = this._getRow(data.env);
    return {row, stat};
  }
  sessionStart(data) {
    const stat = this._getStat(data.env);
    const sessionStat = {
      index: stat.sessions.size,
      currentFile: '',
      doneFiles: 0,
      done: false,
    };
    stat.sessions.set(data.session, sessionStat);
    const row = this._getRow(data.env) + sessionStat.index + 1;
    return {row, sessionStat};
  }
  sessionEnd(data) {
    const stat = this._getStat(data.env);
    const sessionStat = stat.sessions.get(data.session);
    sessionStat.currentFile = '';
    sessionStat.done = true;
    stat.sessions.set(data.session, sessionStat);
    const row = this._getRow(data.env) + sessionStat.index + 1;
    return {row, sessionStat};
  }
  rootSuiteStart(data) {
    const stat = this._getStat(data.env);
    const sessionStat = stat.sessions.get(data.session);
    sessionStat.currentFile = data.suite.name;
    stat.sessions.set(data.session, sessionStat);
    const row = this._getRow(data.env) + sessionStat.index + 1;
    return {row, sessionStat};
  }
  rootSuiteEnd(data) {
    const stat = this._getStat(data.env);
    const sessionStat = stat.sessions.get(data.session);
    sessionStat.doneFiles++;
    stat.sessions.set(data.session, sessionStat);
    const row = this._getRow(data.env) + sessionStat.index + 1;
    return {row, sessionStat};
  }
  hookEnd(data) {
    const stat = this._getStat(data.env);
    if (data.error) {
      stat.errors.push(data);
    }
  }
  testEnd(data) {
    const stat = this._getStat(data.env);
    stat.tests.ended++;
    if (data.error) {
      stat.tests.failed++;
      stat.errors.push(data);
    } else {
      stat.tests.success++;
    }
    const row = this._getRow(data.env);
    return {row, stat};
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
  _getAllErrors() {
    let errors = [];
    this._envStat.forEach(stat => errors = errors.concat(stat.errors));
    return errors;
  }
};
