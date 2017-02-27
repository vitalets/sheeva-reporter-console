/**
 * Utils
 */

const chalk = require('chalk');

/**
 * Simple pluralize
 *
 * @param {String}word
 * @param {Number} count
 * @returns {String}
 */
exports.pluralize = function(word, count) {
  return count === 1 ? word : word + 's';
};

/**
 * Adds needed spaces to value
 *
 * @param {String} value
 * @param {Number} width
 * @returns {String}
 */
exports.leftPad = function(value, width) {
  return ' '.repeat(Math.max(width - value.length, 0)) + value;
};

/**
 * Format number
 *
 * @param {Number} value
 * @returns {String}
 */
exports.num = function(value) {
  const color = value === 0 ? 'red' : 'blue';
  return chalk.bold.blue(value);
};

/**
 * Format required number, uses RED for zero values
 *
 * @param {Number} value
 * @returns {String}
 */
exports.numReq = function(value) {
  const color = value === 0 ? 'red' : 'blue';
  return chalk.bold[color](value);
};