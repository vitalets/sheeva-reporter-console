/**
 * Sticks to some line in terminal and allows to update all lines below later.
 * Cursor is always sitting on the maxRow.
 *
 * #1 xxxxx
 * #2 yyyyy
 * #3 _     <--- StickyCursor created, maxRow = 0
 *
 * > write(0, 'abc')
 *
 * #1 xxxxx
 * #2 yyyyy
 * #3 abc
 * #4 _     <--- maxRow = 1
 *
 * > write(1, 'def')
 *
 * #1 xxxxx
 * #2 yyyyy
 * #3 abc
 * #4 def
 * #5 _     <--- maxRow = 2
 *
 * > write(0, 'xyz')
 *
 * #1 xxxxx
 * #2 yyyyy
 * #3 xyz
 * #4 def
 * #5 _     <--- maxRow = 2
 */

const ae = require('ansi-escapes');
const log = require('../utils/log');

module.exports = class StickyCursor {
  constructor() {
    // Height of block where we are working now. Cursor is always on maxRow.
    this._maxRow = 0;
  }

  /**
   * Last screen row. Reserve place for cursor also.
   *
   * @returns {Number}
   */
  get lastScreenRow() {
    return process.stdout.rows - 2;
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

  _writeDown(row, str) {
    for (let i = this._maxRow; i < row + 1; i++) {
      log(i === row ? str : '');
      this._maxRow++;
    }
  }

  _writeUp(row, str) {
    // todo: use https://github.com/jonschlinkert/window-size
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

