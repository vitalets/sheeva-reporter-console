/**
 * Reporter that just put events into log
 */

const Collector = require('./collector');
const Printer = require('./printer');

module.exports = class ProgressReporter {
  constructor() {
    this._collector = new Collector();
    this._printer = new Printer(this._collector);
  }
  handleEvent(event, data) {
    switch (event) {
      case 'RUNNER_START': {
        this._collector.runnerStart(data);
        this._printer.printHeader();
        this._printer.printEnvs();
        break;
      }
      case 'RUNNER_END': {
        if (data.error) {
          this._printer.printRunnerError(data);
        } else {
          this._collector.runnerEnd();
          this._printer.printSessionBars();
          this._printer.printFooter();
        }
        break;
      }
      case 'ENV_START': {
        this._collector.envStart(data);
        this._printer.printEnvLine(data);
        break;
      }
      case 'ENV_END': {
        this._collector.envEnd(data);
        this._printer.printEnvLine(data);
        break;
      }
      case 'SESSION_START': {
        this._collector.sessionStart(data);
        this._printer.printSessions(data);
        break;
      }
      case 'SESSION_STARTED': {
        this._collector.sessionStarted(data);
        break;
      }
      case 'SESSION_ENDING': {
        this._collector.sessionEnding(data);
        this._printer.printSessions();
        break;
      }
      case 'SESSION_END': {
        this._collector.sessionEnd(data);
        this._printer.printSessions();
        break;
      }
      case 'SUITE_START': {
        if (!data.suite.parent) {
          this._collector.rootSuiteStart(data);
          this._printer.printSessions(data);
        }
        break;
      }
      case 'SUITE_END': {
        if (!data.suite.parent) {
          this._collector.rootSuiteEnd(data);
          this._printer.printSessions(data);
        }
        break;
      }
      case 'HOOK_END': {
        this._collector.hookEnd(data);
        break;
      }
      case 'TEST_END': {
        this._collector.testEnd(data);
        this._printer.printEnvLine(data);
        break;
      }
    }
  }
};
