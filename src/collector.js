/**
 * Collects runtime data
 */

module.exports = class Collector {
  constructor() {
    this._envStats = new Map();
    this._slots = new Set();
    this._runnerStat = {};
    this._splits = [];
  }

  get runnerStat() {
    return this._runnerStat;
  }

  get envStats() {
    return this._envStats;
  }

  get slots() {
    return this._slots;
  }

  get splits() {
    return this._splits;
  }

  runnerStart({files, config, timestamp, onlyFiles}) {
    Object.assign(this._runnerStat, {
      config,
      files,
      onlyFiles,
      startTime: timestamp,
      duration: null,
      errors: null,
    });
    config.envs.forEach(env => {
      this._envStats.set(env, {
        index: this._envStats.size,
        label: env.label,
        sessions: new Map(),
        errors: [],
        started: false,
        ended: false,
        tests: {
          total: 0,
          running: 0,
          ended: 0,
          success: 0,
          failed: 0,
        },
      });
    });
  }

  runnerEnd() {
    Object.assign(this._runnerStat, {
      errors: this._getAllErrors(),
      duration: Date.now() - this._runnerStat.startTime,
    });
  }

  envStart(data) {
    const envStat = this.getEnvStat(data);
    envStat.started = true;
    envStat.tests.total = data.env.testsCount;
  }

  envEnd(data) {
    const envStat = this.getEnvStat(data);
    envStat.ended = true;
  }

  sessionStart(data) {
    const sessionStat = this.getSessionStat(data);
    Object.assign(sessionStat, {
      index: data.session.index,
      currentFile: '',
      files: 0,
      tests: 0,
      start: data.timestamp,
      started: null,
      ending: null,
      end: null,
      duration: null,
    });
    this._slots.add(data.session);
  }

  sessionStarted(data) {
    const sessionStat = this.getSessionStat(data);
    sessionStat.started = data.timestamp;
  }

  sessionEnding(data) {
    const sessionStat = this.getSessionStat(data);
    sessionStat.currentFile = '';
    sessionStat.ending = data.timestamp;
  }

  sessionEnd(data) {
    const sessionStat = this.getSessionStat(data);
    sessionStat.end = data.timestamp;
    sessionStat.duration = sessionStat.end - sessionStat.start;
    this._slots.delete(data.session);
  }

  rootSuiteStart(data) {
    const sessionStat = this.getSessionStat(data);
    sessionStat.currentFile = data.suite.name;
  }

  rootSuiteEnd(data) {
    const sessionStat = this.getSessionStat(data);
    sessionStat.files++;
  }

  suiteSplit(data) {
    this._splits.push(data.suite.name);
  }

  hookEnd(data) {
    if (data.error) {
      const envStat = this.getEnvStat(data);
      envStat.errors.push(data);
    }
  }

  testEnd(data) {
    const envStat = this.getEnvStat(data);
    const sessionStat = this.getSessionStat(data);
    envStat.tests.ended++;
    sessionStat.tests++;
    if (data.error) {
      envStat.tests.failed++;
      envStat.errors.push(data);
    } else {
      envStat.tests.success++;
    }
  }

  getEnvStat(data) {
    return this._envStats.get(data.env);
  }

  getSessionStat(data) {
    const envStat = this.getEnvStat({env: data.session.env});
    let sessionStat = envStat.sessions.get(data.session);
    if (!sessionStat) {
      sessionStat = {};
      envStat.sessions.set(data.session, sessionStat);
    }
    return sessionStat;
  }

  _getAllErrors() {
    let errors = [];
    this._envStats.forEach(envStat => errors = errors.concat(envStat.errors));
    return errors;
  }
};

function getEnvTotalTests(env, envFlatSuites) {
  return envFlatSuites.get(env).reduce((res, flatSuite) => res + flatSuite.tests.length, 0);
}
