import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import autoprefixer from 'autoprefixer';
import assets from 'postcss-assets';
import { existsSync, rmdirSync } from 'fs';
import { dirname } from 'path';

// clear target folder before bundling
const distDir = dirname(pkg.main);
if (existsSync(distDir)) {
  rmdirSync(distDir, {recursive: true});
}

const banner = `/*! Leaflet.Geodesic ${pkg.version} - (c) Henry Thasler - https://github.com/henrythasler/Leaflet.Geodesic */`;

const bundle = (format, filename, options = {}) => ({
  input: 'src/index.ts',
  output: {
    file: filename,
    format: format,
    banner: banner,
    name: 'leaflet.geodesic',
    sourcemap: false,
    globals: {
      leaflet: 'L',
    },
  },
  external: [
    ...Object.keys(pkg.peerDependencies),
    ...(!options.resolve ? Object.keys(pkg.dependencies) : []),
  ],
  plugins: [
    ...(options.resolve ? [resolve()] : []),
    commonjs(),
    typescript({
      typescript: require('typescript'),
      clean: options.stats,
    }),
    postcss({ plugins: [autoprefixer(), assets()] }),
    ...(options.minimize ? [terser()] : []),
  ],
});

export default [
  bundle('umd', pkg.browser, { resolve: true, minimize: true })
];
