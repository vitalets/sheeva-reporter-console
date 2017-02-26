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
 * Default format for numbers
 *
 * @param {Number} str
 * @returns {String}
 */
exports.num = function(str) {
  return chalk.blue.bold(str);
};
