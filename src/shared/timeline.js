/**
 * Prints timeline bars
 */

const chalk = require('../utils/chalk');
const log = require('../utils/log');
const {pluralize, rightPad, getTargetColor} = require('../utils');

const MAX_BAR_WIDTH = 70;
const LABELS_WIDTH = 50;

module.exports = class Timeline {
  constructor(state) {
    this._state = state;
    this._workerTotals = new Map();
    this._maxDuration = 0;
    this._maxBarWidth = process.stdout && process.stdout.columns
      ? Math.min(MAX_BAR_WIDTH, process.stdout.columns - LABELS_WIDTH)
      : MAX_BAR_WIDTH;
  }

  print() {
    this._calcWorkerTotals();
    this._findMaxDuration();
    this._calcBarWidths();
    this._printBars();
  }

  _calcWorkerTotals() {
    this._state.sessions.forEach((sessionStat, session) => {
      const {worker, target} = session;
      const totals = this._workerTotals.get(worker) || createWorkerTotals();
      const sessionDuration = sessionStat.times.end - sessionStat.times.start;
      // exclude non-finished sessions (occured while termination)
      if (sessionDuration <= 0) {
        return;
      }
      const targetDuration = totals.targetDurations.get(target) || 0;
      totals.testsCount += sessionStat.testsCount;
      totals.duration += sessionDuration;
      totals.targetDurations.set(target, targetDuration + sessionDuration);
      this._workerTotals.set(worker, totals);
    });
  }

  _findMaxDuration() {
    this._workerTotals.forEach(totals => {
      if (totals.duration > this._maxDuration) {
        this._maxDuration = totals.duration;
      }
    });
  }

  /**
   * For last target in each worker calc bar width as difference between totals.barWidth and summarized widths
   * to smooth rounding artefacts
   */
  _calcBarWidths() {
    this._workerTotals.forEach(totals => {
      totals.barWidth = this._calcBarWidth(totals.duration);
      let sumBarWidth = 0;
      totals.targetDurations.forEach((targetDuration, target) => {
        const isLast = totals.targetBarWidths.size === totals.targetDurations.size - 1;
        const targetBarWidth = isLast ? totals.barWidth - sumBarWidth : this._calcBarWidth(targetDuration);
        totals.targetBarWidths.set(target, targetBarWidth);
        sumBarWidth += targetBarWidth;
      });
    });
  }

  _printBars() {
    this._workerTotals.forEach(this._printBar, this);
  }

  _printBar(totals, worker) {
    const {barWidth, duration, testsCount, targetBarWidths} = totals;
    const leftLabel = this._getWorkerLabel(worker);
    const bar = this._getBarString(targetBarWidths);
    const spacer = ' '.repeat(Math.max(this._maxBarWidth - barWidth + 2, 0));
    const durationStr = duration === this._maxDuration ? chalk.cyan.bold(duration) : duration;
    const rightLabel = `${durationStr} ms, ${testsCount} ${pluralize('test', testsCount)}`;
    const line = `${leftLabel}${bar}${spacer}${rightLabel}`;
    log(line);
  }

  _calcBarWidth(duration) {
    const koef = this._maxBarWidth / this._maxDuration;
    return Math.round(duration * koef);
  }

  _getBarString(targetBarWidths) {
    let str = '';
    targetBarWidths.forEach((barWidth, target) => {
      const targetIndex = this._state.executionPerTarget.get(target).index;
      const color = getTargetColor(targetIndex);
      str += chalk[color]('▇'.repeat(barWidth));
    });
    return str;
  }

  _getWorkerLabel(worker) {
    const maxIndexWidth = String(this._workerTotals.size).length;
    const indexStr = rightPad(worker.index + 1, maxIndexWidth);
    return chalk.magenta(`Worker #${indexStr}: `);
  }
};

function createWorkerTotals() {
  return {
    testsCount: 0,
    duration: 0,
    barWidth: 0,
    targetDurations: new Map(),
    targetBarWidths: new Map(),
  };
}
