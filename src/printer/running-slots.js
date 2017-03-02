/**
 * Prints running slots
 */

const path = require('path');
const chalk = require('chalk');
const {pluralize, leftPad, num} = require('./utils');

module.exports = class RunningSlots {
  constructor(collector) {
    this._collector = collector;
    this._cursor = null;
  }

  setCursor(cursor) {
    this._cursor = cursor;
  }

  printByIndex(index) {
    const row = this._getRowByIndex(index);
    const session = this._collector.runningSlots[index];
    if (session && !this._isOutOfScreen(row)) {
      this._printLine(row, session);
    }
  }

  printAll() {
    const nonEmptyCount = this._getNonEmptySlotsCount();
    let printedCount = 0;
    for (let index = 0; index < this._collector.runningSlots.length; index++) {
      const row = this._getRowByIndex(index);
      const invisibleSlotsCount = nonEmptyCount - printedCount;
      if (this._isOutOfScreen(row) && invisibleSlotsCount > 1) {
        this._printOutOfScreen(invisibleSlotsCount);
        return;
      }
      this.printByIndex(index);
    }
    this._cutMaxRow(nonEmptyCount);
  }

  _printLine(row, session) {
    const {currentFile, ending} = this._collector.getSessionStat({session});
    let line = this._getSlotLabel(session.slotIndex + 1);
    if (currentFile) {
      const filename = path.basename(currentFile);
      line += `${filename}`;
    } else {
      line += ending ? `ending...` : `starting...`;
    }
    this._cursor.write(row, line);
  }

  _printOutOfScreen(invisibleSlotsCount) {
    const row = process.stdout.rows - 2;
    const footer = `and ${chalk.magenta(invisibleSlotsCount)} ${pluralize('slot', invisibleSlotsCount)} more...`;
    this._cursor.write(row, footer);
  }

  _getSlotLabel(index) {
    const maxIndexWidth = String(this._collector.config.concurrency).length;
    const indexStr = leftPad(index, maxIndexWidth);
    return chalk.magenta(`Slot #${indexStr}: `);
  }

  _getNonEmptySlotsCount() {
    return this._collector.runningSlots.filter(Boolean).length;
  }

  _isOutOfScreen(row) {
    return row >= process.stdout.rows - 2;
  }

  _getRowByIndex(index) {
    return this._collector.envStats.size + index;
  }

  _cutMaxRow(nonEmptyCount) {
    const usedRows = this._collector.envStats.size + nonEmptyCount;
    this._cursor.cut(usedRows);
  }
};
