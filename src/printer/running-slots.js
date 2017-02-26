/**
 * Prints running slots
 *
 */

const chalk = require('chalk');

const MAX_BAR_WIDTH = 60;
// Reserve place for labels around bar
const LABELS_WIDTH = 50;

module.exports = class Bars {
  constructor(collector) {
    this._collector = collector;
    this._slotSessions = new Map();
    this._slotTotals = new Map();
    this._maxDuration = 0;
    this._maxBarWidth = Math.min(MAX_BAR_WIDTH, process.stdout.columns - LABELS_WIDTH);
  }
};
