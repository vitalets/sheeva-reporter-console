/**
 * Sticks to some line in terminal and allows to update all lines below later.
 * Cursor is always sitting on the maxRow.
 *
 * @type {StickyCursor}
 */

const ae = require('ansi-escapes');

module.exports = class StickyCursor {
  constructor () {
    // height of block where we are working now
    // cursor is always on maxRow
    this._maxRow = 0;
  }

  write(row, str) {
    if (row < this._maxRow) {
      this._writeUp(row, str);
    } else {
      this._writeDown(row, str);
    }
  }

  clear() {
    this.cut(0);
  }

  cut(row) {
    if (row < this._maxRow) {
      process.stdout.write(ae.eraseLines(this._maxRow - row + 1));
      this._maxRow = row;
    }
  }

  isOutOfScreen(row) {
    return row >= process.stdout.rows - 1;
  }

  _writeDown(row, str) {
    for (let i = this._maxRow; i < row + 1; i++) {
      console.log(i === row ? str : '');
      this._maxRow++;
    }
  }

  _writeUp(row, str) {
    const minRow = this._maxRow - process.stdout.rows;
    if (row >= minRow) {
      process.stdout.write(ae.cursorUp(this._maxRow - row));
      process.stdout.write(ae.eraseLine);
      process.stdout.write(String(str));
      process.stdout.write(ae.cursorDown(this._maxRow - row));
      process.stdout.write(ae.cursorLeft);
    } else {
      // dont print out of screen up
    }
  }
};

