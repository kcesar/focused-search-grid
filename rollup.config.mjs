import resolve from '@rollup/plugin-node-resolve';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import scss from 'rollup-plugin-scss';
import { generateSW } from 'rollup-plugin-workbox';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

//https://github.com/thgh/rollup-plugin-scss/issues/12#issuecomment-791476941
const importer = (url, _prev, done) => {
  if (url[0] !== '~') {
    return null;
  }
  const info = { file: path.resolve(`node_modules/${url.substr(1)}`) };
  if (done) {
    done(info);
  }
  return info;
};

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
  },
  plugins: [
    scss({
      importer,
      fileName: 'style.css',
      outputStyle: production ? 'compressed' : 'expanded',
    }),
    resolve(),
    commonjs(),
    generateSW({
      swDest: 'dist/service-worker.js',
      globDirectory: 'dist/',
    }),
    production && terser(), // minify, but only in production
  ],
};
