
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';

export default {
  entry: `src/index.js`,
  dest: 'dist/index.js',
  format: 'umd',
  moduleName: 'SheevaReporterConsole',
  sourceMap: true,
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false,
      extensions: ['.browser.js', '.js']
    }),
    commonjs(),
    filesize(),
  ]
};
