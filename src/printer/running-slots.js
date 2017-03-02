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

  print(data) {
    let index = 0;
    for (let session of this._collector.runningSessions.values()) {
      const row = this._collector.envStats.size + index;

      // if reached end of screen...
      if (row === process.stdout.rows - 2 && this._collector.runningSessions.size - index > 1) {
        const invisibleSlots = this._collector.runningSessions.size - index;
        const invisibleSlotsStr = `and ${chalk.magenta(invisibleSlots)} ${pluralize('slot', invisibleSlots)} more...`;
        this._cursor.write(row, invisibleSlotsStr);
        return;
      }

      // if data not passed - session was removed (see SESSION_END), so re-print each line
      // if data.session equls to current session in for, also print that session
      if (!data || data.session === session) {
        this._printLine(row, session);
      }
      index++;
    }

    // if data not passed - session was removed, so cut max row
    if (!data) {
      const usedRows = this._collector.envStats.size + this._collector.runningSessions.size;
      this._cursor.cut(usedRows);
    }
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

  _getSlotLabel(index) {
    const maxIndexWidth = String(this._collector.config.concurrency).length;
    const indexStr = leftPad(index, maxIndexWidth);
    return chalk.magenta(`Slot #${indexStr}: `);
  }
};
