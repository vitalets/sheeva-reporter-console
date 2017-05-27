/**
 * Chalk does not support browser console.log (https://github.com/chalk/chalk/issues/152)
 * But it is implemented here: https://github.com/adamschwartz/log
 * So wrap chalk calls for browser.
 */

const chalk = module.exports = function (str) {
  const style = chalk.styles.join(';');
  const result = `[c="${style}"]${str}[c]`;
  chalk.reset();
  return result;
};

function addStyle(style) {
  chalk.styles.push(style);
  return chalk;
}

function addColor(color) {
  return addStyle(`color: ${color}`);
}

chalk.styles = [];
chalk.reset = function () {
  chalk.styles.length = 0;
};

Object.defineProperty(chalk, 'bold', {get: () => addStyle('font-weight: bold')});
Object.defineProperty(chalk, 'italic', {get: () => addStyle('font-style: italic')});
Object.defineProperty(chalk, 'underline', {get: () => addStyle('text-decoration: underline')});
Object.defineProperty(chalk, 'black', {get: () => addColor('black')});
Object.defineProperty(chalk, 'red', {get: () => addColor('red')});
Object.defineProperty(chalk, 'green', {get: () => addColor('green')});
Object.defineProperty(chalk, 'yellow', {get: () => addColor('#808000')});
Object.defineProperty(chalk, 'blue', {get: () => addColor('blue')});
Object.defineProperty(chalk, 'magenta', {get: () => addColor('magenta')});
Object.defineProperty(chalk, 'cyan', {get: () => addColor('#008080')});
Object.defineProperty(chalk, 'white', {get: () => addColor('white')});
Object.defineProperty(chalk, 'gray', {get: () => addColor('gray')});
