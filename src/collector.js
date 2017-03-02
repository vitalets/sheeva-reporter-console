/**
 * Collects runtime data
 */

module.exports = class Collector {
  constructor() {
    this._envStats = new Map();
    this._sessions = new Map();
    this._runningSlots = [];
    this._runnerStat = {};
    this._config = null;
  }

  get runnerStat() {
    return this._runnerStat;
  }

  get envStats() {
    return this._envStats;
  }

  get runningSlots() {
    return this._runningSlots;
  }

  get sessions() {
    return this._sessions;
  }

  get config() {
    return this._config;
  }

  runnerStart(data) {
    this._config = data.config;
    this._createRunnerStat(data);
    data.config.envs.forEach(env => this._createEnvStat(env));
  }

  runnerEnd() {
    this._runnerStat.duration = Date.now() - this._runnerStat.startTime;
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
    const sessionStat = this._createSessionStat(data.session);
    sessionStat.start = data.timestamp;
    this._runningSlots[data.session.slotIndex] = data.session;
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
    this._runningSlots[data.session.slotIndex] = undefined;
    this._storeErrorData(data);
  }

  topSuiteStart(data) {
    const sessionStat = this.getSessionStat(data);
    sessionStat.currentFile = data.suite.name;
  }

  topSuiteEnd(data) {
    const sessionStat = this.getSessionStat(data);
    sessionStat.files++;
    this._storeErrorData(data);
  }

  hookEnd(data) {
    this._storeErrorData(data);
  }

  testEnd(data) {
    const envStat = this.getEnvStat(data);
    const sessionStat = this.getSessionStat(data);
    envStat.tests.ended++;
    sessionStat.tests++;
    if (data.error) {
      envStat.tests.failed++;
    } else {
      envStat.tests.success++;
    }
    this._storeErrorData(data);
  }

  getEnvStat(data) {
    return this._envStats.get(data.env);
  }

  getSessionStat(data) {
    return this._sessions.get(data.session);
  }

  _createEnvStat(env) {
    this._envStats.set(env, {
      index: this._envStats.size,
      label: env.label,
      sessions: new Map(),
      errors: new Set(),
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
  }

  _createRunnerStat(data) {
    const {files, config, timestamp, only, skip} = data;
    Object.assign(this._runnerStat, {
      config,
      files,
      only,
      skip,
      startTime: timestamp,
      duration: 0,
      errorsData: new Map(),
    });
  }

  _createSessionStat(session) {
    const sessionStat = {
      currentFile: '',
      files: 0,
      tests: 0,
      start: 0,
      started: null,
      ending: null,
      end: null,
      duration: null,
    };
    this._sessions.set(session, sessionStat);
    return sessionStat;
  }

  _storeErrorData(data) {
    if (data.error && !this._runnerStat.errorsData.has(data.error)) {
      this._runnerStat.errorsData.set(data.error, data);
    }
  }

};
