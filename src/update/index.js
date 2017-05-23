/**
 * UpdateReporter: uses console cursor to update output
 */



const Header = require('../shared/header');
const Footer = require('../shared/footer');
const Targets = require('../shared/targets');
const Timeline = require('../shared/timeline');
const Errors = require('../shared/errors');
const StickyCursor = require('./sticky-cursor');
const Workers = require('./workers');

module.exports = class UpdateReporter {
  handleEvent(event, data) { // eslint-disable-line complexity
    switch (event) {
      case 'RUNNER_START':
        new Header(data.result).print();
        this._cursor = new StickyCursor();
        this._targets = new Targets(data.result, this._cursor);
        this._workers = new Workers(data.result, this._cursor);
        this._targets.printAll();
        break;

      case 'RUNNER_END':
        this._unstickCursor();
        this._targets.printAll();
        new Timeline(data.result).print();
        new Errors(data.result).print();
        new Footer(data.result).print();
        break;

      case 'TARGET_START':
      case 'TARGET_END':
        this._targets.printTarget(data);
        break;

      case 'WORKER_ADD':
      case 'WORKER_DELETE':
        this._workers.printAll();
        break;

      case 'SESSION_START':
      case 'SESSION_STARTED':
      case 'SESSION_ENDING':
      case 'SESSION_END':
        this._workers.printWorker(data);
        break;

      case 'SUITE_START':
        if (!data.suite.parent) {
          this._workers.printWorker(data);
        }
        break;

      case 'TEST_END':
        this._targets.printTarget(data);
        break;
    }
  }

  _unstickCursor() {
    if (this._cursor) {
      this._cursor.clear();
    }
  }
};
