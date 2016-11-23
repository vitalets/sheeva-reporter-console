/**
 * Reporter that just put events into log
 */

const Collector = require('./collector');
const Printer = require('./printer');

module.exports = class ProgressReporter {
  constructor() {
    this._collector = new Collector();
    this._printer = new Printer();
  }
  handleEvent(event, data) {
    switch (event) {
      case 'RUNNER_START': {
        this._collector.runnerStart(data);
        this._printer.printHeader(data);
        break;
      }
      case 'RUNNER_END': {
        const info = this._collector.runnerEnd();
        this._printer.printSessionBars(this._collector.envStats);
        this._printer.printFooter(info);
        break;
      }
      case 'ENV_START': {
        const stat = this._collector.envStart(data);
        this._printer.printTestsLine(stat);
        break;
      }
      case 'ENV_END': {
        //console.log(event, data.env);
        break;
      }
      case 'SESSION_START': {
        const stat = this._collector.sessionStart(data);
        this._printer.printSessionLine(stat);
        break;
      }
      case 'SESSION_END': {
        const stat = this._collector.sessionEnd(data);
        this._printer.printSessionLine(stat);
        break;
      }
      case 'SUITE_START': {
        if (!data.suite.parent) {
          const stat = this._collector.rootSuiteStart(data);
          this._printer.printSessionLine(stat);
        }
        break;
      }
      case 'SUITE_END': {
        if (!data.suite.parent) {
          const stat = this._collector.rootSuiteEnd(data);
          this._printer.printSessionLine(stat);
        }
        break;
      }
      case 'HOOK_END': {
        this._collector.hookEnd(data);
        break;
      }
      case 'TEST_END': {
        const stat = this._collector.testEnd(data);
        this._printer.printTestsLine(stat);
        break;
      }
    }
  }
};
