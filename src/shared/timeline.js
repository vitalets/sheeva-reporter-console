/**
 * Prints timeline bars
 */

const chalk = require('chalk');
const {pluralize, rightPad, getEnvColor} = require('./utils');

const MAX_BAR_WIDTH = 70;
const LABELS_WIDTH = 50;

module.exports = class Timeline {
  constructor(result) {
    this._result = result;
    this._workerTotals = new Map();
    this._maxDuration = 0;
    this._maxBarWidth = process.stdout.columns
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
    this._result.sessions.forEach((sessionStat, session) => {
      const {worker, env} = session;
      const totals = this._workerTotals.get(worker) || createWorkerTotals();
      const sessionDuration = sessionStat.times.end - sessionStat.times.start;
      // exclude non-finished sessions (occured while termination)
      if (sessionDuration <= 0) {
        return;
      }
      const envDuration = totals.envDurations.get(env) || 0;
      totals.testsCount += sessionStat.testsCount;
      totals.duration += sessionDuration;
      totals.envDurations.set(env, envDuration + sessionDuration);
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
   * For last env in each worker calc bar width as difference between totals.barWidth and summarized widths
   * to smooth rounding artefacts
   */
  _calcBarWidths() {
    this._workerTotals.forEach(totals => {
      totals.barWidth = this._calcBarWidth(totals.duration);
      let sumBarWidth = 0;
      totals.envDurations.forEach((envDuration, env) => {
        const isLast = totals.envBarWidths.size === totals.envDurations.size - 1;
        const envBarWidth = isLast ? totals.barWidth - sumBarWidth : this._calcBarWidth(envDuration);
        totals.envBarWidths.set(env, envBarWidth);
        sumBarWidth += envBarWidth;
      });
    });
  }

  _printBars() {
    this._workerTotals.forEach(this._printBar, this);
  }

  _printBar(totals, worker) {
    const {barWidth, duration, testsCount, envBarWidths} = totals;
    const leftLabel = this._getWorkerLabel(worker);
    const bar = this._getBarString(envBarWidths);
    const spacer = ' '.repeat(Math.max(this._maxBarWidth - barWidth + 2, 0));
    const durationStr = duration === this._maxDuration ? chalk.cyan(duration) : duration;
    const rightLabel = `${durationStr} ms, ${testsCount} ${pluralize('test', testsCount)}`;
    const line = `${leftLabel}${bar}${spacer}${rightLabel}`;
    console.log(line);
  }

  _calcBarWidth(duration) {
    const koef = this._maxBarWidth / this._maxDuration;
    return Math.round(duration * koef);
  }

  _getBarString(envBarWidths) {
    let str = '';
    envBarWidths.forEach((barWidth, env) => {
      const envIndex = this._result.executionPerEnv.get(env).index;
      const color = getEnvColor(envIndex);
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
    envDurations: new Map(),
    envBarWidths: new Map(),
  };
}
