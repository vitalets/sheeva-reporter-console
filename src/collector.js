/**
 * Collects runtime data
 */

module.exports = class Collector {
  constructor() {
    this._envStats = new Map();
    this._startTime = Date.now();
  }
  get envStats() {
    return this._envStats;
  }
  runnerStart(data) {
    data.envs.forEach(env => {
      this._envStats.set(env, {
        row: null,
        label: '',
        tests: {
          total: 0,
          running: 0,
          ended: 0,
          success: 0,
          failed: 0,
        },
        errors: [],
        sessions: new Map(),
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
    const envStat = this._getEnvStat(data);
    envStat.label = data.label;
    envStat.tests.total = data.testsCount;
    envStat.row = this._getRow(data.env);
    return envStat;
  }
  sessionStart(data) {
    const envStat = this._getEnvStat(data);
    const sessionStat = {
      index: envStat.sessions.size,
      row: envStat.row + envStat.sessions.size + 1,
      currentFile: '',
      files: 0,
      tests: 0,
      started: data.timestamp,
      duration: null,
    };
    envStat.sessions.set(data.session, sessionStat);
    return sessionStat;
  }
  sessionEnd(data) {
    const sessionStat = this._getSessionStat(data);
    sessionStat.currentFile = '';
    sessionStat.duration = data.timestamp - sessionStat.started;
    return sessionStat;
  }
  rootSuiteStart(data) {
    const sessionStat = this._getSessionStat(data);
    sessionStat.currentFile = data.suite.name;
    return sessionStat;
  }
  rootSuiteEnd(data) {
    const sessionStat = this._getSessionStat(data);
    sessionStat.files++;
    return sessionStat;
  }
  hookEnd(data) {
    if (data.error) {
      const envStat = this._getEnvStat(data);
      envStat.errors.push(data);
    }
  }
  testEnd(data) {
    const envStat = this._getEnvStat(data);
    const sessionStat = this._getSessionStat(data);
    envStat.tests.ended++;
    sessionStat.tests++;
    if (data.error) {
      envStat.tests.failed++;
      envStat.errors.push(data);
    } else {
      envStat.tests.success++;
    }
    return envStat;
  }
  _getEnvStat(data) {
    return this._envStats.get(data.env);
  }
  _getSessionStat(data) {
    const envStat = this._getEnvStat(data);
    return envStat.sessions.get(data.session);
  }
  _getRow(env) {
    let prevStat = null;
    for (let key of this._envStats.keys()) {
      if (key !== env) {
        prevStat = this._envStats.get(key);
      } else {
        break;
      }
    }
    return prevStat ? prevStat.row + prevStat.sessions.size + 1 : 0;
  }
  _getAllErrors() {
    let errors = [];
    this._envStats.forEach(envStat => errors = errors.concat(envStat.errors));
    return errors;
  }
};
