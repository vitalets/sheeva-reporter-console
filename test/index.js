/**
 * Only smoke tests now
 * todo: add more
 */

const utils = require('../src/printer/utils');
const ProgressReporter = require('../src');

const reporter = new ProgressReporter();
// todo: reporter.handleEvent('RUNNER_START', {});

console.log('ok');
