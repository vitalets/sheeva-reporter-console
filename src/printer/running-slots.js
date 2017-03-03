/**
 * Prints running slots
 */

const path = require('path');
const chalk = require('chalk');
const {pluralize, rightPad} = require('./utils');

module.exports = class RunningSlots {
  constructor(collector) {
    this._collector = collector;
    this._cursor = null;
    this._printedRows = 0;
    this._maxPrintedSlotIndex = 0;
  }

  setCursor(cursor) {
    this._cursor = cursor;
  }

  printByIndex(slotIndex) {
    if (slotIndex <= this._maxPrintedSlotIndex) {
      const row = this._getRowBySlotIndex(slotIndex);
      this._printRow(row, slotIndex);
    }
  }

  printAll() {
    this._printedRows = 0;
    this._maxPrintedSlotIndex = 0;
    for (let slotIndex of this._collector.slots.keys()) {
      const row = this._getRowBySlotIndex(slotIndex);
      if (row < this._cursor.lastScreenRow) {
        this._printRow(row, slotIndex);
        this._printedRows++;
      } else if (row === this._cursor.lastScreenRow) {
        this._printLastRow(row, slotIndex);
        this._printedRows++;
        break;
      }
    }

    this._cutMaxRow();
  }

  _printRow(row, slotIndex) {
    let line = this._getSlotLabel(slotIndex + 1);
    const session = this._collector.slots.get(slotIndex);
    if (session) {
      line += this._getSessionStatus(session);
    } else {
      line += chalk.gray('free');
    }
    this._updateMaxPrintedSlotIndex(slotIndex);
    this._cursor.write(row, line);
  }

  _printLastRow(row, slotIndex) {
    const invisibleSlotsCount = this._collector.slots.size - this._printedRows;
    if (invisibleSlotsCount > 1) {
      this._printOutOfScreenSummary(invisibleSlotsCount);
    } else {
      this._printRow(row, slotIndex);
    }
  }

  _printOutOfScreenSummary(invisibleSlotsCount) {
    const summary = `and ${chalk.magenta(invisibleSlotsCount)} ${pluralize('slot', invisibleSlotsCount)} more...`;
    this._cursor.write(this._cursor.lastScreenRow, summary);
  }

  _getSlotLabel(index) {
    const maxIndexWidth = String(this._collector.config.concurrency).length;
    const indexStr = rightPad(index, maxIndexWidth);
    return chalk.magenta(`Slot #${indexStr}: `);
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

  _getRowBySlotIndex(index) {
    return this._collector.envStats.size + index;
  }

  _cutMaxRow() {
    const usedRows = this._collector.envStats.size + this._printedRows;
    this._cursor.cut(usedRows);
  }

  _updateMaxPrintedSlotIndex(slotIndex) {
    if (slotIndex > this._maxPrintedSlotIndex) {
      this._maxPrintedSlotIndex = slotIndex;
    }
  }
};
