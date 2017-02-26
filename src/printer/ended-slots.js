/**
 * Prints ended slots as timeline bars
 */

const chalk = require('chalk');
const {pluralize, leftPad} = require('./utils');

const MAX_BAR_WIDTH = 60;
const LABELS_WIDTH = 50;
const COLORS = ['green', 'yellow', 'blue', 'white'];

module.exports = class EndedSlots {
  constructor(sessionStats) {
    this._sessionStats = sessionStats;
    this._slotTotals = new Map();
    this._maxDuration = 0;
    this._maxBarWidth = Math.min(MAX_BAR_WIDTH, process.stdout.columns - LABELS_WIDTH);
    this._envColors = new Map();
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

  _calcBarWidths() {
    this._slotTotals.forEach(totals => {
      totals.envDurations.forEach((envDuration, env) => {
        const barWidth = this._calcBarWidth(envDuration);
        totals.envBarWidths.set(env, barWidth);
        totals.barWidth += barWidth;
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
      const color = this._getEnvColor(env);
      str += chalk[color]('▇'.repeat(barWidth));
    });
    return str;
  }

  _getEnvColor(env) {
    let color = this._envColors.get(env);
    if (!color) {
      color = COLORS[this._envColors.size % COLORS.length];
      this._envColors.set(env, color);
    }
    return color;
  }

  _getSlotLabel(index) {
    const maxIndexWidth = String(this._slotTotals.size).length;
    const indexStr = leftPad(index, maxIndexWidth);
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
