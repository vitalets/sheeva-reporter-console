/**
 * Utils
 */

const chalk = require('./chalk');

const TARGET_COLORS = ['green', 'yellow', 'blue', 'white'];

/**
 * Simple pluralize
 *
 * @param {String}word
 * @param {Number} count
 * @returns {String}
 */
exports.pluralize = function (word, count) {
  return count === 1 ? word : word + 's';
};

/**
 * Adds needed spaces to value
 *
 * @param {String} value
 * @param {Number} width
 * @returns {String}
 */
exports.rightPad = function (value, width) {
  value = String(value);
  return value + ' '.repeat(Math.max(width - value.length, 0));
};

/**
 * Format number
 *
 * @param {Number} value
 * @returns {String}
 */
exports.num = function (value) {
  return chalk.bold.blue(value);
};

/**
 * Format required number, uses RED for zero values
 *
 * @param {Number} value
 * @returns {String}
 */
exports.numReq = function (value) {
  const color = value === 0 ? 'red' : 'blue';
  return chalk.bold[color](value);
};

/**
 * Returns target color
 *
 * @param {Number} index
 * @returns {String}
 */
exports.getTargetColor = function (index) {
  const colorIndex = index % TARGET_COLORS.length;
  return TARGET_COLORS[colorIndex];
};
