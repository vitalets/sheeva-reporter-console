/**
 * Prints running workers
 */

const path = require('path');
const chalk = require('../utils/chalk');
const {pluralize, rightPad} = require('../utils');

module.exports = class RunningWorkers {
  constructor(state, cursor) {
    this._state = state;
    this._cursor = cursor;
    this._printedRows = 0;
    this._maxPrintedWorkerIndex = 0;
  }

  printAll() { // eslint-disable-line max-statements
    this._printedRows = 0;
    this._maxPrintedWorkerIndex = 0;
    for (let worker of this._state.workers) {
      const row = this._getRow(worker);
      if (row < this._cursor.lastScreenRow) {
        this._printRow(row, worker);
        this._printedRows++;
      } else if (row === this._cursor.lastScreenRow) {
        this._printLastRow(row, worker);
        this._printedRows++;
        break;
      }
    }
    this._cutMaxRow();
  }

  printWorker({session}) {
    const worker = session.worker;
    if (worker.index <= this._maxPrintedWorkerIndex) {
      const row = this._getRow(worker);
      this._printRow(row, worker);
    }
  }

  _printRow(row, worker) {
    const label = this._getWorkerLabel(worker.index + 1);
    const sessionStat = this._state.sessions.get(worker.session);
    const status = sessionStat ? this._getSessionStatus(sessionStat) : chalk.gray('free');
    this._updateMaxPrintedWorkerIndex(worker.index);
    this._cursor.write(row, `${label}${status}`);
  }

  _printLastRow(row, worker) {
    const invisibleWorkersCount = this._state.workers.size - this._printedRows;
    if (invisibleWorkersCount > 1) {
      this._printOutOfScreenSummary(invisibleWorkersCount);
    } else {
      this._printRow(row, worker);
    }
  }

  _printOutOfScreenSummary(invisibleWorkersCount) {
    const count = invisibleWorkersCount;
    const summary = `and ${chalk.magenta(count)} ${pluralize('worker', count)} more...`;
    this._cursor.write(this._cursor.lastScreenRow, summary);
  }

  _getWorkerLabel(index) {
    const concurrency = this._state.config.concurrency;
    const maxIndexWidth = String(concurrency).length;
    const indexStr = rightPad(index, maxIndexWidth);
    return chalk.magenta(`Worker #${indexStr}: `);
  }

  _getSessionStatus(sessionStat) { // eslint-disable-line complexity, max-statements
    const {files, times} = sessionStat;

    if (!times || !times.start) {
      return chalk.gray('waiting session...');
    }

    if (!times.started) {
      return chalk.gray('starting session...');
    }

    if (!times.ending) {
      const currentFile = files[files.length - 1];
      return currentFile ? path.basename(currentFile) : '';
    }

    if (!times.ended) {
      return chalk.gray('ending session...');
    }

    return chalk.gray('ended');
  }

  _getRow(worker) {
    return this._state.executionPerTarget.size + worker.index;
  }

  _cutMaxRow() {
    const usedRows = this._state.executionPerTarget.size + this._printedRows;
    this._cursor.cut(usedRows);
  }

  _updateMaxPrintedWorkerIndex(workerIndex) {
    if (workerIndex > this._maxPrintedWorkerIndex) {
      this._maxPrintedWorkerIndex = workerIndex;
    }
  }
};
