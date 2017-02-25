/**
 * Prints slots timeline bars
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

  print() {
    this._fillSlotSessions();
    this._fillSlotTotals();
    this._calcBarWidths();
    this._printBars();
  }

  _printBars() {
    this._slotTotals.forEach((totals, index) => this._printBar(totals, index));
  }

  _printBar(totals, index) {
    const {barWidth, duration, testsCount} = totals;
    const leftLabel = getSlotLabel(index + 1);
    const bar = chalk.green('▇'.repeat(barWidth));
    const spacer = repeatStr(' ', this._maxBarWidth - barWidth + 2);
    const durationStr = duration === this._maxDuration ? chalk.cyan(duration) : duration;
    const rightLabel = `${durationStr} ms, ${testsCount} test(s)`;
    const line = `${leftLabel}${bar}${spacer}${rightLabel}`;
    console.log(line);
  }

  _fillSlotSessions() {
    this._collector.sessions.forEach((sessionStat, session) => {
      const slotSessions = this._slotSessions.get(session.slotIndex) || [];
      const sessionData = {
        tests: sessionStat.tests,
        duration: sessionStat.end - sessionStat.start,
        session: session,
      };
      slotSessions.push(sessionData);
      this._slotSessions.set(session.slotIndex, slotSessions);
    });
  }

  _fillSlotTotals() {
    this._slotSessions.forEach((slotSessions, index) => {
      const duration = slotSessions.reduce((res, data) => res + data.duration, 0);
      const testsCount = slotSessions.reduce((res, data) => res + data.tests, 0);
      this._storeMaxDuration(duration);
      this._slotTotals.set(index, {duration, testsCount});
    });
  }

  _storeMaxDuration(duration) {
    if (duration > this._maxDuration) {
      this._maxDuration = duration;
    }
  }

  _calcBarWidths() {
    const koef = this._maxBarWidth / this._maxDuration;
    this._slotTotals.forEach(totals => {
      totals.barWidth = Math.round(totals.duration * koef);
    });
  }
};

/**
 * Native String.repeat throws error for negative count
 */
function repeatStr(str, count) {
  count = count < 0 ? 0 : count;
  return str.repeat(count);
}

function getSlotLabel(index) {
  const indexStr = index < 10 ? `${index} ` : `${index}`;
  return chalk.magenta(`Slot #${indexStr}: `);
}
