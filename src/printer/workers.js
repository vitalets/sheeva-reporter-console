/**
 * Prints running workers
 */

const path = require('path');
const chalk = require('chalk');
const {pluralize, rightPad} = require('./utils');

module.exports = class RunningWorkers {
  constructor(collector) {
    this._collector = collector;
    this._cursor = null;
    this._printedRows = 0;
    this._maxPrintedWorkerIndex = 0;
  }

  setCursor(cursor) {
    this._cursor = cursor;
  }

  printByIndex(workerIndex) {
    if (workerIndex <= this._maxPrintedWorkerIndex) {
      const row = this._getRowByWorkerIndex(workerIndex);
      this._printRow(row, workerIndex);
    }
  }

  printAll() {
    this._printedRows = 0;
    this._maxPrintedWorkerIndex = 0;
    for (let workerIndex of this._collector.workers.keys()) {
      const row = this._getRowByWorkerIndex(workerIndex);
      if (row < this._cursor.lastScreenRow) {
        this._printRow(row, workerIndex);
        this._printedRows++;
      } else if (row === this._cursor.lastScreenRow) {
        this._printLastRow(row, workerIndex);
        this._printedRows++;
        break;
      }
    }

    this._cutMaxRow();
  }

  _printRow(row, workerIndex) {
    let line = this._getWorkerLabel(workerIndex + 1);
    const session = this._collector.workers.get(workerIndex);
    if (session) {
      line += this._getSessionStatus(session);
    } else {
      line += chalk.gray('free');
    }
    this._updateMaxPrintedWorkerIndex(workerIndex);
    this._cursor.write(row, line);
  }

  _printLastRow(row, workerIndex) {
    const invisibleWorkersCount = this._collector.workers.size - this._printedRows;
    if (invisibleWorkersCount > 1) {
      this._printOutOfScreenSummary(invisibleWorkersCount);
    } else {
      this._printRow(row, workerIndex);
    }
  }

  _printOutOfScreenSummary(invisibleWorkersCount) {
    const summary = `and ${chalk.magenta(invisibleWorkersCount)} ${pluralize('worker', invisibleWorkersCount)} more...`;
    this._cursor.write(this._cursor.lastScreenRow, summary);
  }

  _getWorkerLabel(index) {
    const maxIndexWidth = String(this._collector.config.concurrency).length;
    const indexStr = rightPad(index, maxIndexWidth);
    return chalk.magenta(`Worker #${indexStr}: `);
  }

  _getSessionStatus(session) {
    const {currentFile, ending} = this._collector.getSessionStat({session});
    if (currentFile) {
      const filename = path.basename(currentFile);
      return `${filename}`;
    } else {
      return ending ? `ending session...` : `starting session...`;
    }
  }

  _getRowByWorkerIndex(index) {
    return this._collector.envStats.size + index;
  }

  _cutMaxRow() {
    const usedRows = this._collector.envStats.size + this._printedRows;
    this._cursor.cut(usedRows);
  }

  _updateMaxPrintedWorkerIndex(workerIndex) {
    if (workerIndex > this._maxPrintedWorkerIndex) {
      this._maxPrintedWorkerIndex = workerIndex;
    }
  }
};
