/**
 * Console reporter
 */

const UpdateReporter = require('./update');
const AppendReporter = require('./append');

const DEFAULT_OPTIONS = {
  append: false,
};

module.exports = class ConsoleReporter {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Boolean} [options.append=false]
   */
  constructor(options) {
    this._options = Object.assign({}, DEFAULT_OPTIONS, options);
    this._reporter = this._options.append ? new AppendReporter() : new UpdateReporter();
    this.handleEvent = this._reporter.handleEvent.bind(this._reporter);
  }
};
