/**
 * Timeline reporter
 */

const {pluralize, rightPad, num} = require('./utils');
const Header = require('./header');
const Footer = require('./footer');
const Envs = require('./envs');
const StickyCursor = require('./sticky-cursor');
const Timeline = require('./timeline');
const Workers = require('./workers');
const Errors = require('./errors');

module.exports = class TimelineReporter {
  constructor() {
    this._startTime = Date.now();
  }
  handleEvent(event, data) {
    switch (event) {
      case 'RUNNER_START': {
        new Header(data.result).print();
        this._cursor = new StickyCursor();
        this._envs = new Envs(data.result, this._cursor);
        this._workers = new Workers(data.result, this._cursor);
        this._envs.printAll();
        break;
      }

      case 'RUNNER_END': {
        this._unstickCursor();
        this._envs.printAll();
        new Timeline(data.result).print();
        new Errors(data.result).print();
        new Footer(data.result).print(this._startTime);
        break;
      }

      case 'ENV_START': {
        this._envs.printEnv(data);
        break;
      }
      case 'ENV_END': {
        this._envs.printEnv(data);
        break;
      }

      case 'WORKER_ADD': {
        this._workers.printAll();
        break;
      }

      case 'WORKER_DELETE': {
        this._workers.printAll();
        break;
      }

      case 'SESSION_START': {
        this._workers.printWorker(data);
        break;
      }
      case 'SESSION_STARTED': {
        this._workers.printWorker(data);
        break;
      }
      case 'SESSION_ENDING': {
        this._workers.printWorker(data);
        break;
      }
      case 'SESSION_END': {
        this._workers.printWorker(data);
        break;
      }
      case 'SUITE_START': {
        if (!data.suite.parent) {
          this._workers.printWorker(data);
        }
        break;
      }
      case 'TEST_END': {
        this._envs.printEnv(data);
        break;
      }
    }
  }

  _unstickCursor() {
    if (this._cursor) {
      this._cursor.clear();
    }
  }
};
