/**
 * Prints ended slots as timeline bars
 */

const chalk = require('chalk');
const {pluralize, rightPad} = require('./utils');

const MAX_BAR_WIDTH = 70;
const LABELS_WIDTH = 50;

module.exports = class EndedSlots {
  constructor(sessionStats, envColors) {
    this._sessionStats = sessionStats;
    this._slotTotals = new Map();
    this._maxDuration = 0;
    this._maxBarWidth = Math.min(MAX_BAR_WIDTH, process.stdout.columns - LABELS_WIDTH);
    this._envColors = envColors;
  }

  print() {
    this._fillSlotTotals();
    this._findMaxDuration();
    this._calcBarWidths();
    this._printBars();
  }

  _fillSlotTotals() {
    this._sessionStats.forEach((sessionStat, session) => {
      const totals = this._slotTotals.get(session.slotIndex) || createNewTotals();
      const sessionDuration = sessionStat.end - sessionStat.start;
      const envDuration = totals.envDurations.get(session.env) || 0;
      totals.testsCount += sessionStat.tests;
      totals.duration += sessionDuration;
      totals.envDurations.set(session.env, envDuration + sessionDuration);
      this._slotTotals.set(session.slotIndex, totals);
    });
  }

  _findMaxDuration() {
    this._slotTotals.forEach(totals => {
      if (totals.duration > this._maxDuration) {
        this._maxDuration = totals.duration;
      }
    });
  }

  /**
   * For last env in each slot calc bar width as difference between totals.barWidth and summarized widths
   * to smooth rounding artefacts
   */
  _calcBarWidths() {
    this._slotTotals.forEach(totals => {
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
    this._slotTotals.forEach((totals, index) => this._printBar(totals, index));
  }

  _printBar(totals, index) {
    const {barWidth, duration, testsCount, envBarWidths} = totals;
    const leftLabel = this._getSlotLabel(index + 1);
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
      const color = this._envColors.get(env);
      str += chalk[color]('▇'.repeat(barWidth));
    });
    return str;
  }

  _getSlotLabel(index) {
    const maxIndexWidth = String(this._slotTotals.size).length;
    const indexStr = rightPad(index, maxIndexWidth);
    return chalk.magenta(`Slot #${indexStr}: `);
  }
};

function createNewTotals() {
  return {
    testsCount: 0,
    duration: 0,
    barWidth: 0,
    envDurations: new Map(),
    envBarWidths: new Map(),
  }
}
